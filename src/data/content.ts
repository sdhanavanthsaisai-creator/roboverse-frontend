export type ProblemCard = {
  code: string;
  title: string;
  body: string;
};

export const problemStatement: ProblemCard[] = [
  {
    code: 'CONST/01',
    title: '5 kg maximum payload',
    body: 'A small autonomous vehicle capped at 5 kilograms carries every sensor, board and battery it will ever get.',
  },
  {
    code: 'CONST/02',
    title: 'The maze keeps changing',
    body: 'The layout may not remain identical from one attempt to the next — no memorised route survives.',
  },
  {
    code: 'CONST/03',
    title: 'Routes get blocked',
    body: 'Some corridors close between runs, so a previously valid path can silently become a dead end.',
  },
  {
    code: 'CONST/04',
    title: 'New obstacles appear',
    body: 'Objects it has never seen enter the map mid-mission and must be detected, not predicted.',
  },
  {
    code: 'CONST/05',
    title: 'Shortest ≠ best',
    body: 'The shortest-looking route may not always be the one that survives contact with reality.',
  },
  {
    code: 'CONST/06',
    title: 'Multi-sensor integration',
    body: 'Ultrasonic ranging, IMU, wheel odometry and vision are fused into one belief about the world.',
  },
  {
    code: 'CONST/07',
    title: 'Understand while moving',
    body: 'The vehicle builds its map on the fly — no prior scan, no human survey, no external guidance.',
  },
  {
    code: 'CONST/08',
    title: 'Zero human guidance',
    body: 'Every navigation decision is made on-board, in real time, without a joystick or a pilot.',
  },
  {
    code: 'CONST/09',
    title: 'Exit found AND faster over time',
    body: 'Success means reaching the exit, then reaching it quicker as the environment keeps shifting.',
  },
];

export type Subdivision = {
  index: string;
  title: string;
  blurb: string;
  slots: string[];
};

export const subdivisions: Subdivision[] = [
  {
    index: '01',
    title: 'Components & Sensors',
    blurb: 'The physical perception stack that lets the vehicle read a maze it has never seen.',
    slots: ['Ultrasonic ranger array', 'IMU (accel + gyro)', 'Wheel encoders', 'Vision module'],
  },
  {
    index: '02',
    title: 'CAD Design',
    blurb: 'Chassis, sensor mounts and enclosures — kept light enough to stay inside the 5 kg budget.',
    slots: ['Chassis assembly', 'Sensor mast mount', 'Battery bay', 'Exploded view'],
  },
  {
    index: '03',
    title: 'Electronics & Power',
    blurb: 'Motor driver, microcontroller and battery topology inside a strict weight envelope.',
    slots: ['Motor driver board', 'MCU pin map', 'Power budget', 'Wiring harness'],
  },
  {
    index: '04',
    title: 'Navigation & Learning',
    blurb: 'How fused sensor data becomes a decision — and how those decisions improve attempt after attempt.',
    slots: ['Sensor-fusion equations', 'Planner cost function', 'Learning update rule', 'Weight budget'],
  },
  {
    index: '05',
    title: 'Code Display',
    blurb: 'The source behind each subsystem, surfaced below with one click.',
    slots: ['Planner module', 'Fusion module', 'Firmware module', 'Training module'],
  },
];
