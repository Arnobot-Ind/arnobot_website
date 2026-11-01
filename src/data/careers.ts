/**
 * The careers section's content that more than one page reads: the open roles
 * (the filtered list on /career/open-positions and the role select in
 * `CareerForm`) and the hiring process, which /career walks through.
 *
 * `slug` is what the form posts and /api/career emails as the role, so keep
 * the values stable even when a title is reworded.
 */

export interface OpenRole {
  readonly slug: string;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  /** Exam question categories this role is tested on; synced to the exam's roles. */
  readonly skills: readonly string[];
}

export interface RoleGroup {
  /** The discipline's key in the filter on /career/open-positions. */
  readonly slug: string;
  readonly discipline: string;
  readonly roles: readonly OpenRole[];
}

/** Open roles, grouped by discipline, in the order the pages list them.
 *  Every role is open as both a full-time position and an internship, onsite. */
export const ROLE_GROUPS: readonly RoleGroup[] = [
  {
    slug: 'design',
    discipline: 'Design',
    roles: [
      {
        slug: 'cad-designer',
        title: 'CAD Designer',
        body: 'Part and assembly modelling for ARNOBOT platforms — drawings, tolerances and release-ready CAD that the shop floor can build from.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['CAD & Design', 'Mechanical Design', 'Manufacturing', 'Aptitude & General'],
      },
      {
        slug: 'cad-designer-intern',
        title: 'CAD Designer Intern',
        body: 'Part and assembly modelling for ARNOBOT platforms — drawings, tolerances and release-ready CAD that the shop floor can build from. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['CAD & Design', 'Mechanical Design', 'Manufacturing', 'Aptitude & General'],
      },
    ],
  },
  {
    slug: 'electronics',
    discipline: 'Electronics',
    roles: [
      {
        slug: 'electronics-engineer',
        title: 'Electronics Engineer',
        body: 'Board design, power and signal integrity, bring-up and test for the electronics inside our robots.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['Electronics', 'Microcontrollers', 'Sensor Integration', 'Aptitude & General'],
      },
      {
        slug: 'electronics-engineer-intern',
        title: 'Electronics Engineer Intern',
        body: 'Board design, power and signal integrity, bring-up and test for the electronics inside our robots. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['Electronics', 'Microcontrollers', 'Sensor Integration', 'Aptitude & General'],
      },
      {
        slug: 'robot-electrical-engineer',
        title: 'Robot Electrical Engineer',
        body: 'Harnessing, power distribution, motor drives and sensor wiring that survive vibration, dust and wash-down.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['Electronics', 'Microcontrollers', 'Control Theory', 'Sensor Integration'],
      },
      {
        slug: 'robot-electrical-engineer-intern',
        title: 'Robot Electrical Engineer Intern',
        body: 'Harnessing, power distribution, motor drives and sensor wiring that survive vibration, dust and wash-down. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['Electronics', 'Microcontrollers', 'Control Theory', 'Sensor Integration'],
      },
    ],
  },
  {
    slug: 'manufacturing',
    discipline: 'Manufacturing',
    roles: [
      {
        slug: 'manufacturing-engineer',
        title: 'Manufacturing Engineer',
        body: 'Process planning, fixtures, assembly and quality — turning a released design into repeatable hardware.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['Manufacturing', 'Mechanical Design', 'CAD & Design', 'Aptitude & General'],
      },
      {
        slug: 'manufacturing-engineer-intern',
        title: 'Manufacturing Engineer Intern',
        body: 'Process planning, fixtures, assembly and quality — turning a released design into repeatable hardware. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['Manufacturing', 'Mechanical Design', 'CAD & Design', 'Aptitude & General'],
      },
      {
        slug: 'robot-design-manufacturing',
        title: 'Robot Design & Manufacturing Engineer',
        body: 'Own a robot subsystem from concept and design-for-manufacture through prototype build and testing.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['Mechanical Design', 'Manufacturing', 'CAD & Design', 'Kinematics'],
      },
      {
        slug: 'robot-design-manufacturing-intern',
        title: 'Robot Design & Manufacturing Engineer Intern',
        body: 'Own a robot subsystem from concept and design-for-manufacture through prototype build and testing. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['Mechanical Design', 'Manufacturing', 'CAD & Design', 'Kinematics'],
      },
    ],
  },
  {
    slug: 'robotics',
    discipline: 'Robotics',
    roles: [
      {
        slug: 'robotics-engineer',
        title: 'Robotics Engineer',
        body: 'Mechanical design and integration across the SAIBYA, NEXUS and ATM platforms — drivetrain, enclosure, payload mounts, and the tests that prove them.',
        tags: ['Onsite · Ahmedabad', 'Full-time', '1 – 5 years'],
        skills: ['Kinematics', 'Control Theory', 'Coding', 'Sensor Integration', 'Mechanical Design', 'Aptitude & General'],
      },
      {
        slug: 'robotics-engineer-intern',
        title: 'Robotics Engineer Intern',
        body: 'Mechanical design and integration across the SAIBYA, NEXUS and ATM platforms — drivetrain, enclosure, payload mounts, and the tests that prove them. Open to final-year students and recent graduates.',
        tags: ['Onsite · Ahmedabad', 'Internship', '3 – 6 months'],
        skills: ['Kinematics', 'Control Theory', 'Coding', 'Sensor Integration', 'Mechanical Design', 'Aptitude & General'],
      },
    ],
  },
];

/** Every open role, in page order. */
export const OPEN_ROLES: readonly OpenRole[] = ROLE_GROUPS.flatMap((group) => group.roles);

export const ROLE_COUNT = OPEN_ROLES.length;

/** The one option in the form that is not a listed role. */
export const OPEN_APPLICATION = { slug: 'open-application', title: 'Open Application (Any Role)' } as const;

/** The pictogram on a hiring step's card; the page maps each key to an icon. */
export type HiringStepIcon = 'form' | 'call' | 'build' | 'visit';

/** One step of the hiring process. */
export interface HiringStep {
  readonly name: string;
  readonly icon: HiringStepIcon;
  /** How long it takes, or how long until the answer — the one line a
   *  candidate scans for. Kept out of `detail` so it is not said twice. */
  readonly takes: string;
  /** The step in one line — what the candidate does, or gets. */
  readonly body: string;
  /** The commitment behind it: what it is, and what it is not. */
  readonly detail: string;
}

/** How to apply, and what happens after — four steps, in the order they happen. */
export const HIRING_PROCESS: readonly HiringStep[] = [
  {
    name: 'Apply',
    icon: 'form',
    takes: 'Yes or no in five business days',
    body: 'Visit ARNOBOT → Careers → Apply Now. Complete the step-by-step quiz + questionnaire.',
    detail: 'We read every one — no silent pipelines, no waiting on a portal.',
  },
  {
    name: 'Intro call',
    icon: 'call',
    takes: '30 minutes',
    body: 'A conversation with your future manager.',
    detail: 'What you have built, what we are building, and whether the two meet.',
  },
  {
    name: 'Technical round',
    icon: 'build',
    takes: 'One live session',
    body: 'Work through a real problem from our backlog.',
    detail: 'Worked through together — no puzzles, no whiteboard trivia, no take-home marathon.',
  },
  {
    name: 'Workshop & offer',
    icon: 'visit',
    takes: 'Decision within a week',
    body: 'Visit the workshop, meet the team, and drive a robot.',
    detail: 'Nothing is decided over a call alone — you see the place and the people first.',
  },
];
