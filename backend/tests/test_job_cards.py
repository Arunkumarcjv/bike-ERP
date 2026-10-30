from datetime import timedelta

from django.utils import timezone

from apps.audit.models import AuditLog

from .test_api import SALES_EXEC, ApiTestCase

SERVICE_ADVISOR = 'ananya.sharma@akashbajaj.com'


def next_weekday():
    day = timezone.localdate() + timedelta(days=1)
    return day + timedelta(days=1) if day.weekday() == 6 else day


def job_card_payload(**overrides):
    body = {
        'customerName': 'Syed Ahmed', 'customerPhone': '+91 93476 22734', 'customerEmail': 'syedahmed@gmail.com',
        'customerAddress': 'No. 12, Anna Nagar, Vijayawada - 520001',
        'registrationNumber': 'ap 16 k 7038', 'manufacturer': 'Hero', 'modelName': 'Splendor Plus',
        'variant': 'Self Start', 'vehicleType': 'Two Wheeler', 'chassisNumber': 'MBLHAW12345678901',
        'engineNumber': 'HAW123456', 'colour': 'Black', 'dateOfSale': '2023-06-12', 'odometerKm': 12850,
        'keyNumber': 'K123', 'sellingDealer': 'Sri Sai Motors, Vijayawada', 'vehicleTagNumber': 'VT-001',
        'inAt': '2025-10-14T10:30:00+05:30', 'expectedDeliveryAt': '2025-10-15T17:00:00+05:30',
        'advisorName': 'Ravi Kumar', 'technicianName': 'Suresh', 'priority': 'MEDIUM', 'stage': 'CHECKED_IN',
        'serviceType': 'PERIODIC_MAINTENANCE', 'insuranceProvider': 'Bajaj Allianz', 'policyNumber': 'BA/123456789',
        'insuranceStart': '2025-01-01', 'insuranceExpiry': '2025-12-31', 'warrantyType': 'Manufacturer Warranty',
        'warrantyStart': '2023-06-12', 'warrantyExpiry': '2026-06-12', 'freeServiceCoupon': 'FS1234',
        'fuelLevel': 'HALF', 'damageMarks': ['FRONT_LEFT'], 'remarks': 'Minor scratches on left side body.',
        'inspection': [
            {'key': 'body', 'label': 'Body Condition', 'condition': 'GOOD', 'remarks': ''},
            {'key': 'scratches', 'label': 'Existing Scratches / Dents', 'condition': 'NEEDS_ATTENTION',
             'remarks': 'Left side panel scratches'},
        ],
        'complaints': [{
            'category': 'Starting Problem', 'description': 'Vehicle not starting in morning',
            'customerRemarks': 'Starts after 2-3 attempts', 'reportedProblem': 'Battery / Electrical',
            'priority': 'MEDIUM',
        }],
    }
    body.update(overrides)
    return body


class JobCardFormTests(ApiTestCase):
    def test_create_full_job_card(self):
        client, _ = self.login(SERVICE_ADVISOR)
        res = client.post('/api/v1/job-cards/', job_card_payload(), format='json')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertRegex(res.data['jobCardNumber'], r'^JC\d{8}-\d{3}$')
        self.assertEqual(res.data['registrationNumber'], 'AP 16 K 7038')
        self.assertEqual(res.data['customerPhone'], '+91 93476 22734')
        self.assertEqual(res.data['complaints'][0]['reportedProblem'], 'Battery / Electrical')
        second = client.post('/api/v1/job-cards/', job_card_payload(), format='json')
        self.assertEqual(int(second.data['jobCardNumber'][-3:]), int(res.data['jobCardNumber'][-3:]) + 1)
        self.assertTrue(AuditLog.objects.filter(action='JOBCARD_CREATED', entity_id=res.data['id']).exists())

    def test_required_fields_and_formats(self):
        client, _ = self.login(SERVICE_ADVISOR)
        res = client.post('/api/v1/job-cards/', job_card_payload(
            customerName='', manufacturer='', customerPhone='12345',
            expectedDeliveryAt='2025-10-13T10:00:00+05:30'), format='json')
        self.assertEqual(res.status_code, 400)
        for key in ('customerName', 'manufacturer', 'customerPhone', 'expectedDeliveryAt'):
            self.assertIn(key, res.data)
        bad = client.post('/api/v1/job-cards/', job_card_payload(inspection=[{'key': 'x', 'condition': 'SUPER'}]),
                          format='json')
        self.assertIn('inspection', bad.data)

    def test_draft_then_create(self):
        client, _ = self.login(SERVICE_ADVISOR)
        draft = client.post('/api/v1/job-cards/', {'stage': 'DRAFT', 'customerName': 'Half done'}, format='json')
        self.assertEqual(draft.status_code, 201, draft.content)
        incomplete = client.patch(f"/api/v1/job-cards/{draft.data['id']}/", {'stage': 'CHECKED_IN'}, format='json')
        self.assertEqual(incomplete.status_code, 400)
        done = client.patch(f"/api/v1/job-cards/{draft.data['id']}/", job_card_payload(), format='json')
        self.assertEqual(done.status_code, 200, done.content)
        self.assertEqual(done.data['jobCardNumber'], draft.data['jobCardNumber'])

    def test_sales_cannot_create_job_cards(self):
        client, _ = self.login(SALES_EXEC)
        self.assertEqual(client.post('/api/v1/job-cards/', job_card_payload(), format='json').status_code, 403)


class AppointmentTests(ApiTestCase):
    def book(self, client, **overrides):
        body = {'customerName': 'Rohith V.', 'phone': '9845012345', 'registrationNumber': 'ka-03-jm-4921',
                'date': next_weekday().isoformat(), 'timeSlot': '08:30 - 09:30', 'packageName': '1st Free Periodic'}
        body.update(overrides)
        return client.post('/api/v1/appointments/', body, format='json')

    def test_book_then_check_in_with_job_card(self):
        client, _ = self.login(SERVICE_ADVISOR)
        apt = self.book(client)
        self.assertEqual(apt.status_code, 201, apt.content)
        self.assertEqual(apt.data['registrationNumber'], 'KA-03-JM-4921')
        card = client.post('/api/v1/job-cards/', job_card_payload(appointmentId=apt.data['id']), format='json')
        self.assertEqual(card.status_code, 201, card.content)
        linked = client.get(f"/api/v1/appointments/{apt.data['id']}/").data
        self.assertEqual(linked['status'], 'CHECKED_IN')
        self.assertEqual(linked['jobCardId'], card.data['id'])
        again = client.post('/api/v1/job-cards/', job_card_payload(appointmentId=apt.data['id']), format='json')
        self.assertEqual(again.status_code, 400)

    def test_sunday_and_slot_capacity(self):
        client, _ = self.login(SERVICE_ADVISOR)
        day = next_weekday()
        sunday = day + timedelta(days=6 - day.weekday())
        self.assertIn('date', self.book(client, date=sunday.isoformat()).data)
        for i in range(5):
            res = self.book(client, timeSlot='17:30 - 18:30', phone=f'98450{i:05d}')
            self.assertEqual(res.status_code, 201, res.content)
        full = self.book(client, timeSlot='17:30 - 18:30')
        self.assertEqual(full.status_code, 400)
        self.assertIn('timeSlot', full.data)
