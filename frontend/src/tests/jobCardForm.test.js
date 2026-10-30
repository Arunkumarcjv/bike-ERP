import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import { getInitialSeedData } from '../data/seed';
import { emptyJobCardForm, toJobCardPayload, validateJobCard, fromJobCard } from '../features/service/jobCardForm';

const filledForm = () => ({
  ...emptyJobCardForm(new Date('2025-10-14T10:30:00')),
  customerName: 'Syed Ahmed',
  customerPhone: '93476 22734',
  registrationNumber: 'ap 16 k 7038',
  manufacturer: 'Hero',
  modelName: 'Splendor Plus',
  advisorName: 'Ravi Kumar',
});

describe('Create Job Card form', () => {
  beforeEach(() => {
    useAppStore.setState({ ...getInitialSeedData() });
  });

  it('requires the starred fields, but not for a draft', () => {
    const errors = validateJobCard(emptyJobCardForm());
    ['customerName', 'customerPhone', 'registrationNumber', 'manufacturer', 'modelName', 'advisorName'].forEach((f) =>
      expect(errors[f]).toBeTruthy()
    );
    expect(validateJobCard(emptyJobCardForm(), { draft: true })).toEqual({});
    expect(validateJobCard(filledForm())).toEqual({});
  });

  it('rejects bad phone, registration and delivery before the in time', () => {
    const errors = validateJobCard({
      ...filledForm(),
      customerPhone: '12345',
      registrationNumber: 'HELLO',
      expectedDate: '2025-10-13',
    });
    expect(errors.customerPhone).toBeTruthy();
    expect(errors.registrationNumber).toBeTruthy();
    expect(errors.expectedDate).toBeTruthy();
  });

  it('normalises the payload', () => {
    const payload = toJobCardPayload(filledForm(), { draft: false });
    expect(payload.customerPhone).toBe('+91 93476 22734');
    expect(payload.registrationNumber).toBe('AP 16 K 7038');
    expect(payload.stage).toBe('CHECKED_IN');
    expect(payload.inAt).toBeTruthy();
    expect(payload.complaints).toEqual([]); // the empty starter row is dropped
    expect(toJobCardPayload(filledForm(), { draft: true }).stage).toBe('DRAFT');
  });

  it('creates a numbered job card and checks its appointment in', async () => {
    const apt = useAppStore.getState().appointments[0];
    const card = await useAppStore
      .getState()
      .saveJobCard({ ...toJobCardPayload(filledForm(), { draft: false }), appointmentId: apt.id });
    expect(card.jobCardNumber).toMatch(/^JC\d{8}-\d{3}$/);
    const state = useAppStore.getState();
    expect(state.jobCards[0].id).toBe(card.id);
    const linked = state.appointments.find((a) => a.id === apt.id);
    expect(linked.status).toBe('CHECKED_IN');
    expect(linked.jobCardId).toBe(card.id);
  });

  it('continues a draft under the same number', async () => {
    const save = useAppStore.getState().saveJobCard;
    const draft = await save(toJobCardPayload({ ...emptyJobCardForm(), customerName: 'Half done' }, { draft: true }));
    expect(draft.stage).toBe('DRAFT');
    const form = { ...fromJobCard(draft), ...filledForm() };
    const done = await save(toJobCardPayload(form, { draft: false }), draft.id);
    expect(done.jobCardNumber).toBe(draft.jobCardNumber);
    expect(useAppStore.getState().jobCards.filter((jc) => jc.id === draft.id)).toHaveLength(1);
  });
});
