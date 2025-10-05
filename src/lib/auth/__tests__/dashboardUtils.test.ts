import { normalizeDashboard, pickDashboard } from '../../auth/dashboardUtils';

describe('normalizeDashboard', () => {
  it('returns null for nullish', () => {
    expect(normalizeDashboard(undefined)).toBeNull();
    expect(normalizeDashboard(null)).toBeNull();
    expect(normalizeDashboard('')).toBeNull();
  });

  it('normalizes various casing and extra text', () => {
    expect(normalizeDashboard('Student')).toBe('/student');
    expect(normalizeDashboard(' go-to-student ')).toBe('/student');
    expect(normalizeDashboard('INSTRUCTOR')).toBe('/instructor');
    expect(normalizeDashboard('be-instructor-now')).toBe('/instructor');
  });

  it('returns null on unknown preference', () => {
    expect(normalizeDashboard('admin')).toBeNull();
  });
});

describe('pickDashboard', () => {
  const studentOnly = { roles: [{ name: 'STUDENT' }] };
  const instructorOnly = { roles: [{ name: 'INSTRUCTOR' }] };
  const bothRoles = { roles: [{ name: 'INSTRUCTOR' }, { name: 'STUDENT' }] };
  const noRoles = { roles: [] };

  it('honors preferred student when allowed', () => {
    expect(pickDashboard({ ...bothRoles, defaultDashboard: 'student' })).toBe(
      '/student'
    );
  });

  it('honors preferred instructor when allowed', () => {
    expect(
      pickDashboard({ ...bothRoles, defaultDashboard: 'INSTRUCTOR' })
    ).toBe('/instructor');
  });

  it('defaults to student when both roles and no valid preference', () => {
    expect(pickDashboard(bothRoles)).toBe('/student');
  });

  it('falls back to available role', () => {
    expect(pickDashboard(studentOnly)).toBe('/student');
    expect(pickDashboard(instructorOnly)).toBe('/instructor');
  });

  it('returns null when no valid roles', () => {
    expect(pickDashboard(noRoles)).toBeNull();
    expect(pickDashboard(null)).toBeNull();
  });
});
