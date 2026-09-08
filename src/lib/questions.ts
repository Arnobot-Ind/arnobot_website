/**
 * ARNOBOT applicant question bank.
 * ───────────────────────────────────────────────────────────────────────────
 * This is the seed corpus loaded into the `questions` table on first boot.
 * Each item has exactly FOUR options and a 0-based `correct` index.
 *
 * The serve layer SHUFFLES the four options per attempt, so the position of
 * the correct answer here does not matter and cannot be memorised.
 *
 * ── Growing the bank to 500 ──────────────────────────────────────────────────
 * 1) Append more objects below (keep the same shape), OR
 * 2) Add/import them from the Admin dashboard (/admin → Questions tab), OR
 * 3) Bulk-import a JSON array of the same shape via POST /api/admin/questions.
 * Categories are free-form strings; the eight below are the intended buckets.
 */

export type Category =
  | "Kinematics"
  | "Control Theory"
  | "Swarm Robotics"
  | "Microcontrollers"
  | "Coding"
  | "Mechanical Design"
  | "Sensor Integration"
  | "Aptitude & General";

export type SeedQuestion = {
  category: Category;
  difficulty?: "easy" | "medium" | "hard";
  question: string;
  /** Optional diagram for visual questions (path under /public or a URL). */
  image?: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
};

export const QUESTION_BANK: SeedQuestion[] = [
  // ───────────────────────────── Kinematics ─────────────────────────────
  { category: "Kinematics", question: "Forward kinematics computes which of the following?", options: ["Joint angles from the end-effector pose", "The end-effector pose from the joint angles", "Joint torques from external forces", "Velocities from accelerations"], correct: 1 },
  { category: "Kinematics", question: "How many degrees of freedom does a free rigid body have in 3D space?", options: ["3", "4", "6", "12"], correct: 2 },
  { category: "Kinematics", question: "Inverse kinematics for a manipulator generally:", options: ["Always has a single unique solution", "May have multiple solutions or none", "Is always a linear problem", "Ignores joint limits"], correct: 1 },
  { category: "Kinematics", question: "Denavit–Hartenberg (DH) parameters describe:", options: ["Sensor noise characteristics", "The geometric relationship between consecutive link frames", "Battery discharge curves", "PID controller gains"], correct: 1 },
  { category: "Kinematics", question: "A revolute joint provides:", options: ["Pure linear motion", "Rotational motion about an axis", "Spherical 3-DOF motion", "No relative motion"], correct: 1 },
  { category: "Kinematics", question: "A prismatic joint provides:", options: ["Rotational motion", "Translational (linear) motion", "2-DOF planar motion", "Unconstrained motion"], correct: 1 },
  { category: "Kinematics", question: "The manipulator Jacobian relates:", options: ["Joint angles to joint torques", "Joint velocities to end-effector velocities", "Positions to accelerations", "Mass to inertia"], correct: 1 },
  { category: "Kinematics", difficulty: "hard", question: "A kinematic singularity occurs when:", options: ["The robot is powered off", "The Jacobian loses rank and a DOF is lost", "All joints read zero", "The battery is full"], correct: 1 },
  { category: "Kinematics", question: "A homogeneous transformation matrix in 3D has dimensions:", options: ["3×3", "4×4", "2×2", "6×6"], correct: 1 },
  { category: "Kinematics", question: "Roll, pitch and yaw collectively describe:", options: ["Linear position", "Orientation (rotation) about three axes", "Joint torque", "Translation only"], correct: 1 },
  { category: "Kinematics", question: "A 6-DOF robotic arm can in principle:", options: ["Only translate the tool", "Reach an arbitrary position AND orientation within its workspace", "Only rotate the tool", "Never reach a fixed point"], correct: 1 },
  { category: "Kinematics", question: "The workspace of a manipulator is:", options: ["Its total mass", "The set of all reachable end-effector poses", "Its maximum speed", "Its control-loop frequency"], correct: 1 },
  { category: "Kinematics", question: "Euler-angle representations can suffer from:", options: ["Aliasing", "Gimbal lock", "Quantisation error", "Actuator deadband"], correct: 1 },
  { category: "Kinematics", question: "Quaternions are often preferred over Euler angles because they:", options: ["Always use less memory", "Avoid gimbal lock", "Are easier for humans to read", "Never need normalisation"], correct: 1 },
  { category: "Kinematics", question: "Odometry for a differential-drive robot is computed from:", options: ["GPS only", "Wheel speeds, wheel radius and track width", "Camera images only", "Arm joint encoders"], correct: 1 },

  // ──────────────────────────── Control Theory ───────────────────────────
  { category: "Control Theory", question: "In a PID controller, what does the 'I' term stand for?", options: ["Inertial", "Integral", "Impulse", "Inverse"], correct: 1 },
  { category: "Control Theory", question: "The integral term in a PID controller primarily:", options: ["Adds measurement noise", "Eliminates steady-state error", "Always increases overshoot", "Lowers the sampling rate"], correct: 1 },
  { category: "Control Theory", question: "The derivative term in a PID controller:", options: ["Removes steady-state error", "Responds to the rate of change of error, adding damping", "Sets the reference setpoint", "Filters the power supply"], correct: 1 },
  { category: "Control Theory", question: "Increasing the proportional gain too much typically causes:", options: ["A slower response", "Oscillation or instability", "Steady-state error to disappear", "Reduced bandwidth"], correct: 1 },
  { category: "Control Theory", question: "A system is BIBO stable if:", options: ["Any input gives zero output", "Every bounded input produces a bounded output", "It contains no feedback", "Its poles are in the right half-plane"], correct: 1 },
  { category: "Control Theory", difficulty: "hard", question: "For a continuous LTI system, stability requires all poles to lie in:", options: ["The right half of the s-plane", "The left half of the s-plane", "Only on the imaginary axis", "At the origin"], correct: 1 },
  { category: "Control Theory", difficulty: "hard", question: "For a discrete-time LTI system, stability requires all poles to lie:", options: ["Outside the unit circle", "Inside the unit circle", "On the real axis", "At infinity"], correct: 1 },
  { category: "Control Theory", question: "A transfer function is defined as:", options: ["Input divided by output", "The Laplace transform of output over input at zero initial conditions", "Mass over damping", "Gain over phase"], correct: 1 },
  { category: "Control Theory", question: "Open-loop control is characterised by:", options: ["Use of output feedback", "No use of output feedback", "Guaranteed instability", "A required Kalman filter"], correct: 1 },
  { category: "Control Theory", question: "Settling time is:", options: ["Time to reach the first peak", "Time to reach and stay within a tolerance band of the final value", "The steady-state error", "The damping ratio"], correct: 1 },
  { category: "Control Theory", question: "A damping ratio of exactly zero produces:", options: ["A critically damped response", "Sustained (undamped) oscillation", "An overdamped response", "No response at all"], correct: 1 },
  { category: "Control Theory", question: "As the damping ratio decreases, the percentage overshoot generally:", options: ["Increases", "Decreases", "Stays constant", "Becomes zero"], correct: 0 },
  { category: "Control Theory", difficulty: "hard", question: "Integral windup happens when:", options: ["The derivative term is too small", "The actuator saturates while the integrator keeps accumulating error", "The setpoint is zero", "The sensor is perfectly noiseless"], correct: 1 },
  { category: "Control Theory", question: "A Bode plot displays:", options: ["Position versus time", "Magnitude and phase versus frequency", "Pole locations only", "The step response"], correct: 1 },
  { category: "Control Theory", question: "A state-space model represents a system using:", options: ["A single transfer function only", "First-order differential equations with state variables (A, B, C, D matrices)", "Only its frequency response", "Boolean logic gates"], correct: 1 },

  // ──────────────────────────── Swarm Robotics ───────────────────────────
  { category: "Swarm Robotics", question: "Swarm robotics is primarily inspired by:", options: ["Single powerful supercomputers", "The collective behaviour of social insects and animals", "Centralised mainframes", "Manual human scheduling"], correct: 1 },
  { category: "Swarm Robotics", question: "A defining property of swarm systems is:", options: ["A single central controller", "Decentralised control and robustness", "One robot performing all work", "Fixed physical wiring between robots"], correct: 1 },
  { category: "Swarm Robotics", question: "Stigmergy refers to:", options: ["Direct radio command of each robot", "Indirect coordination via traces left in the environment", "GPS waypoint following", "A control-loop gain"], correct: 1 },
  { category: "Swarm Robotics", question: "Emergent behaviour means:", options: ["Behaviour explicitly programmed per robot", "Complex global behaviour arising from simple local interactions", "A hardware fault", "Manual teleoperation"], correct: 1 },
  { category: "Swarm Robotics", question: "The classic Boids flocking model uses the rules:", options: ["Proportional, integral, derivative", "Separation, alignment and cohesion", "Roll, pitch and yaw", "Sense, plan, act"], correct: 1 },
  { category: "Swarm Robotics", question: "Scalability in a swarm means:", options: ["The robots grow physically larger", "The system keeps working as the number of robots changes", "Only two robots are allowed", "The batteries get bigger"], correct: 1 },
  { category: "Swarm Robotics", question: "Consensus algorithms in a swarm aim to:", options: ["Maximise energy consumption", "Make agents converge to a common value", "Disable all communication", "Elect one permanent leader"], correct: 1 },
  { category: "Swarm Robotics", question: "A major advantage of a swarm over a single robot is:", options: ["Always lower total cost", "Redundancy and fault tolerance", "Simpler overall design", "No coordination needed"], correct: 1 },
  { category: "Swarm Robotics", question: "Self-organisation in a swarm requires:", options: ["A central server", "Local interactions and feedback without central control", "A fully pre-computed global plan", "A human approving each step"], correct: 1 },
  { category: "Swarm Robotics", question: "Ant Colony Optimisation (ACO) is typically used for:", options: ["Image sharpening", "Pathfinding and combinatorial optimisation", "Battery charging", "PID auto-tuning"], correct: 1 },
  { category: "Swarm Robotics", question: "Communication in a robot swarm is most often:", options: ["Always a global broadcast", "Local and limited in range", "Strictly wired", "Absent and unnecessary"], correct: 1 },
  { category: "Swarm Robotics", question: "Particle Swarm Optimisation (PSO) is a:", options: ["Sorting algorithm", "Population-based optimisation algorithm", "Encryption scheme", "File system"], correct: 1 },
  { category: "Swarm Robotics", question: "A leaderless swarm is generally:", options: ["More fragile to any single failure", "More robust to the loss of any single member", "Faster to program centrally", "Dependent on one critical node"], correct: 1 },
  { category: "Swarm Robotics", question: "Aggregation behaviour in a swarm means the robots:", options: ["Spread infinitely far apart", "Gather together into a group or region", "Stop communicating", "Shut themselves down"], correct: 1 },
  { category: "Swarm Robotics", question: "Task allocation in a swarm decides:", options: ["The battery chemistry", "How tasks are distributed among the robots", "The CPU clock speed", "The chassis colour"], correct: 1 },

  // ──────────────────────────── Microcontrollers ──────────────────────────
  { category: "Microcontrollers", question: "PWM stands for:", options: ["Power Wave Mode", "Pulse Width Modulation", "Phase Width Measurement", "Peripheral Write Mode"], correct: 1 },
  { category: "Microcontrollers", question: "An ADC peripheral converts:", options: ["Digital to analog", "Analog to digital", "AC to DC", "Address to data"], correct: 1 },
  { category: "Microcontrollers", question: "The I²C bus uses how many signal lines?", options: ["1", "2", "3", "4"], correct: 1 },
  { category: "Microcontrollers", question: "SPI is best described as:", options: ["Asynchronous single-wire", "Synchronous, full-duplex, master/slave", "A wireless protocol", "An analog interface"], correct: 1 },
  { category: "Microcontrollers", question: "UART communication is:", options: ["Synchronous and parallel", "Asynchronous serial", "A variant of I²C", "USB-only"], correct: 1 },
  { category: "Microcontrollers", question: "An interrupt allows the MCU to:", options: ["Run permanently slower", "Respond to an event immediately, pausing the main program", "Disable the CPU", "Raise the clock frequency"], correct: 1 },
  { category: "Microcontrollers", question: "A watchdog timer is used to:", options: ["Keep the time of day", "Reset the system if the software stops responding", "Measure temperature", "Generate PWM"], correct: 1 },
  { category: "Microcontrollers", question: "A pull-up resistor on a GPIO input:", options: ["Drives the pin permanently LOW", "Defines a default HIGH level when the line is otherwise open", "Increases motor current", "Performs analog-to-digital conversion"], correct: 1 },
  { category: "Microcontrollers", question: "How many discrete levels can a 10-bit ADC resolve?", options: ["10", "256", "1024", "65536"], correct: 2 },
  { category: "Microcontrollers", question: "Flash memory in a microcontroller typically holds:", options: ["Only the stack", "The non-volatile program/firmware", "Nothing at all", "Video frames"], correct: 1 },
  { category: "Microcontrollers", question: "To drive a DC motor from an MCU you generally need:", options: ["A direct GPIO pin alone", "A motor driver / H-bridge", "Just a series resistor", "An ADC channel"], correct: 1 },
  { category: "Microcontrollers", question: "A timer/counter peripheral can be used to:", options: ["Only blink one LED", "Generate timing, PWM and measure pulse widths", "Store files", "Add more RAM"], correct: 1 },
  { category: "Microcontrollers", question: "RTOS stands for:", options: ["Robotic Tool Operating Suite", "Real-Time Operating System", "Remote Terminal OS", "Random Task Order System"], correct: 1 },
  { category: "Microcontrollers", question: "Debouncing is required when reading:", options: ["A motor's back-EMF", "Noisy mechanical switch / button inputs", "The ADC reference", "A wireless link"], correct: 1 },
  { category: "Microcontrollers", difficulty: "hard", question: "In embedded C, the `volatile` keyword tells the compiler that a variable:", options: ["Should be deleted", "May change unexpectedly (e.g. inside an ISR), so it must not be over-optimised", "Is a compile-time constant", "Must be stored in flash"], correct: 1 },

  // ─────────────────────────────── Coding ─────────────────────────────────
  { category: "Coding", question: "The time complexity of binary search on a sorted array is:", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
  { category: "Coding", question: "A stack data structure follows which ordering?", options: ["FIFO", "LIFO", "Random access", "Always sorted"], correct: 1 },
  { category: "Coding", question: "A queue data structure follows which ordering?", options: ["LIFO", "FIFO", "Sorted order", "Hashed order"], correct: 1 },
  { category: "Coding", question: "In ROS, nodes most commonly communicate via:", options: ["Shared global variables", "Topics, services and actions", "Email", "USB cables only"], correct: 1 },
  { category: "Coding", question: "Which of these is NOT a built-in Python data type?", options: ["list", "tuple", "dict", "matrix"], correct: 3 },
  { category: "Coding", question: "A segmentation fault in C/C++ usually indicates:", options: ["A syntax error", "An invalid memory access (e.g. a bad pointer)", "A perfectly successful run", "A harmless compiler warning"], correct: 1 },
  { category: "Coding", question: "Accessing an array element by index is, on average:", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0 },
  { category: "Coding", question: "In Git, creating a branch lets you:", options: ["Delete the repository", "Develop changes in isolation from the main line", "Compile the code", "Automatically run tests"], correct: 1 },
  { category: "Coding", question: "A pointer in C holds:", options: ["A string literal", "A memory address", "Only a floating-point value", "Only a function name"], correct: 1 },
  { category: "Coding", question: "A correct recursive function must always have:", options: ["An array argument", "A base case that stops the recursion", "A pointer argument", "A GPU"], correct: 1 },
  { category: "Coding", question: "Which sorting algorithm has an average time complexity of O(n log n)?", options: ["Bubble sort", "Merge sort", "Insertion sort", "Selection sort"], correct: 1 },
  { category: "Coding", difficulty: "hard", question: "A race condition occurs when:", options: ["Code runs too quickly", "Two threads access shared data and the result depends on their timing", "A loop never terminates", "A variable is declared constant"], correct: 1 },
  { category: "Coding", question: "JSON is best described as:", options: ["A programming language", "A text-based data-interchange format", "A database engine", "An operating system"], correct: 1 },
  { category: "Coding", question: "In object-oriented programming, encapsulation means:", options: ["Copy-pasting code", "Bundling data with the methods that act on it and hiding internal state", "Using global variables everywhere", "Disabling all functions"], correct: 1 },
  { category: "Coding", question: "A hash map (dictionary) offers an average lookup time of:", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0 },

  // ───────────────────────────── Mechanical Design ────────────────────────
  { category: "Mechanical Design", question: "A gear reduction (a larger driven gear) generally:", options: ["Increases speed and reduces torque", "Increases torque and reduces speed", "Increases supply voltage", "Has no mechanical effect"], correct: 1 },
  { category: "Mechanical Design", question: "The factor of safety of a component is:", options: ["The robot's top speed", "The ratio of the component's strength to the expected load", "The spare battery margin", "The number of fasteners used"], correct: 1 },
  { category: "Mechanical Design", question: "A stepper motor is especially well suited to:", options: ["High-speed cruising only", "Precise positioning in discrete steps", "Generating analog signals", "Heating elements"], correct: 1 },
  { category: "Mechanical Design", question: "Torque about an axis is defined as:", options: ["Force times velocity", "Force times the perpendicular distance from the axis", "Mass times acceleration", "Power times time"], correct: 1 },
  { category: "Mechanical Design", question: "Aluminium is a popular robot-frame material because it is:", options: ["The heaviest option available", "Lightweight with a good strength-to-weight ratio", "An electrical insulator", "Strongly magnetic"], correct: 1 },
  { category: "Mechanical Design", question: "The primary purpose of a bearing is to:", options: ["Store electrical energy", "Reduce friction and support a rotating or moving part", "Generate torque", "Sense joint position"], correct: 1 },
  { category: "Mechanical Design", question: "The location of a mobile robot's centre of gravity mainly affects its:", options: ["Wi-Fi range", "Stability and tendency to tip over", "CPU clock speed", "Paint colour"], correct: 1 },
  { category: "Mechanical Design", question: "A servo motor (hobby/industrial) typically integrates:", options: ["Only a bare DC motor", "A motor, a gearbox and position feedback control", "Only a battery", "A camera"], correct: 1 },
  { category: "Mechanical Design", question: "Backlash in a gear train refers to:", options: ["The gear material grade", "The lost motion / play between meshing gear teeth", "The motor current draw", "A type of lubricant"], correct: 1 },
  { category: "Mechanical Design", question: "A higher motor Kv rating means the motor delivers:", options: ["More torque per amp", "More RPM per volt (and less torque per amp)", "A larger physical size", "A higher mass"], correct: 1 },
  { category: "Mechanical Design", question: "A 4-wheel-drive UGV such as ARNOBOT's SAIBYA mainly improves:", options: ["Wi-Fi throughput", "Traction and mobility over rough terrain", "Battery chemistry", "The number of sensors"], correct: 1 },
  { category: "Mechanical Design", question: "Mechanical stress is defined as:", options: ["Force times area", "Force per unit area", "Mass per unit volume", "Energy per unit time"], correct: 1 },
  { category: "Mechanical Design", difficulty: "hard", question: "To increase a beam's bending stiffness most efficiently you should increase its:", options: ["Overall length", "Cross-sectional moment of inertia (e.g. its depth)", "Surface colour", "Surface finish"], correct: 1 },
  { category: "Mechanical Design", question: "Compared with wheels, continuous tracks (treads) generally provide:", options: ["Higher top speed on paved roads", "Lower ground pressure and better traction on soft terrain", "Much less traction", "A lighter overall vehicle"], correct: 1 },
  { category: "Mechanical Design", question: "CAD software is primarily used to:", options: ["Charge batteries", "Create 2D/3D models of parts and assemblies", "Compile firmware", "Train neural networks"], correct: 1 },

  // ──────────────────────────── Sensor Integration ────────────────────────
  { category: "Sensor Integration", question: "An IMU typically combines which sensors?", options: ["A camera and a LIDAR", "An accelerometer and a gyroscope (often a magnetometer too)", "GPS and Wi-Fi", "Two cameras"], correct: 1 },
  { category: "Sensor Integration", question: "A LIDAR measures distance using:", options: ["Sound waves", "The time-of-flight of laser light", "Magnetic field strength", "Air pressure"], correct: 1 },
  { category: "Sensor Integration", question: "A rotary encoder on a motor shaft measures:", options: ["Temperature", "Shaft rotation / position (and hence speed)", "Battery voltage", "Humidity"], correct: 1 },
  { category: "Sensor Integration", question: "Sensor fusion refers to:", options: ["Joining two robots together", "Combining data from multiple sensors for a more reliable estimate", "Wiring two batteries in series", "Merging two code repositories"], correct: 1 },
  { category: "Sensor Integration", difficulty: "hard", question: "A Kalman filter is used to:", options: ["Recharge sensors", "Estimate state by fusing noisy measurements with a system model", "Compile source code", "Cool the processor"], correct: 1 },
  { category: "Sensor Integration", question: "GPS accuracy is most degraded:", options: ["Under open sky", "Indoors or under heavy cover", "Only at night", "Only when stationary"], correct: 1 },
  { category: "Sensor Integration", question: "An ultrasonic range sensor determines distance from:", options: ["Laser time-of-flight", "The echo time of an ultrasonic sound pulse", "Radio waves", "Light intensity"], correct: 1 },
  { category: "Sensor Integration", question: "A gyroscope measures:", options: ["Linear acceleration", "Angular velocity (rate of rotation)", "Absolute distance", "Temperature"], correct: 1 },
  { category: "Sensor Integration", question: "An accelerometer sitting at rest on a table measures approximately:", options: ["Exactly zero on all axes", "The acceleration due to gravity (about 1 g)", "Its angular rate", "Magnetic north"], correct: 1 },
  { category: "Sensor Integration", difficulty: "hard", question: "Sampling a signal below the Nyquist rate causes:", options: ["Improved accuracy", "Aliasing", "No measurable effect", "Higher resolution"], correct: 1 },
  { category: "Sensor Integration", question: "A magnetometer is most commonly used to estimate:", options: ["Distance to an obstacle", "Heading relative to magnetic north", "Linear speed", "Joint torque"], correct: 1 },
  { category: "Sensor Integration", question: "Sensor drift describes:", options: ["Sudden one-off spikes only", "A slow accumulation of error over time", "Perfectly stable readings", "The sampling rate"], correct: 1 },
  { category: "Sensor Integration", question: "Estimating depth from two horizontally-offset cameras is called:", options: ["Monocular vision", "Stereo vision", "Thermal imaging", "Infrared ranging"], correct: 1 },
  { category: "Sensor Integration", question: "To suppress high-frequency noise from a sensor signal you would apply:", options: ["A high-pass filter", "A low-pass filter", "A power amplifier", "A motor driver"], correct: 1 },
  { category: "Sensor Integration", question: "Fusing IMU data with wheel encoders to track pose is an example of:", options: ["Image classification", "Dead-reckoning / odometry", "Data encryption", "Pure path planning"], correct: 1 },

  // ─────────────────────────── Aptitude & General ─────────────────────────
  { category: "Aptitude & General", question: "ARNOBOT's SAIBYA is best described as:", options: ["An aerial drone", "A heavy-duty 4×4 unmanned ground vehicle (UGV)", "A web application", "A single sensor module"], correct: 1 },
  { category: "Aptitude & General", question: "A robot is best defined as a machine that can:", options: ["Only perform arithmetic", "Sense, process and act in the physical world", "Only display images", "Only store data"], correct: 1 },
  { category: "Aptitude & General", question: "If one robot finishes a task in 4 hours, two identical robots sharing the work equally take about:", options: ["1 hour", "2 hours", "4 hours", "8 hours"], correct: 1 },
  { category: "Aptitude & General", question: "Which item is the odd one out?", options: ["Accelerometer", "Gyroscope", "Magnetometer", "Servo motor"], correct: 3 },
  { category: "Aptitude & General", question: "'Autonomous' operation means the robot:", options: ["Needs a human for every move", "Operates without continuous human control", "Has no sensors", "Is always remote-controlled"], correct: 1 },
  { category: "Aptitude & General", question: "Complete the series: 2, 4, 8, 16, ?", options: ["24", "30", "32", "64"], correct: 2 },
  { category: "Aptitude & General", question: "You discover a critical safety bug just before a customer demo. The best action is to:", options: ["Hide it to avoid delaying the demo", "Report it promptly so it can be addressed", "Ignore it and hope for the best", "Blame a teammate"], correct: 1 },
  { category: "Aptitude & General", question: "Teleoperation means:", options: ["The robot teaches a human", "A human controls the robot from a distance", "Robots talk only to each other", "The robot charges automatically"], correct: 1 },
  { category: "Aptitude & General", question: "In robotics, SLAM stands for:", options: ["Single Layer Actuator Module", "Simultaneous Localisation And Mapping", "Sensor Logic And Memory", "Serial Link Access Mode"], correct: 1 },
  { category: "Aptitude & General", question: "A robot inspecting an oil pipeline mainly adds value by:", options: ["Looking modern", "Reducing risk to humans and improving inspection reliability", "Consuming more fuel", "Increasing manual labour"], correct: 1 },
  { category: "Aptitude & General", question: "Gear A has 10 teeth and meshes with gear B of 30 teeth. Gear B turns at:", options: ["3× the speed of A", "1/3 the speed of A", "The same speed as A", "Twice the speed of A"], correct: 1 },
  { category: "Aptitude & General", question: "Which unit measures electric current?", options: ["Volt", "Ampere", "Watt", "Ohm"], correct: 1 },
  { category: "Aptitude & General", question: "When project requirements are ambiguous, the best first response is to:", options: ["Guess silently and proceed", "Ask clarifying questions", "Refuse the task outright", "Wait indefinitely"], correct: 1 },
  { category: "Aptitude & General", question: "A prototype is:", options: ["The final mass-produced unit", "An early model built to test and learn from a concept", "A type of battery", "A kind of sensor"], correct: 1 },
  { category: "Aptitude & General", question: "Electrical power equals:", options: ["Voltage minus current", "Voltage times current", "Current divided by resistance squared", "Voltage plus current"], correct: 1 },

  // ───────────────────────── Diagram-based questions ─────────────────────────
  { category: "Control Theory", difficulty: "medium", image: "/diagrams/pid-loop.svg", question: "In the feedback control diagram shown, C is the controller and P is the plant. What does the summing junction (Σ) compute?", options: ["The total power delivered to the plant", "The error: reference r minus the feedback", "The raw plant output y", "The sensor calibration gain"], correct: 1 },
  { category: "Kinematics", difficulty: "easy", image: "/diagrams/two-link-arm.svg", question: "The planar manipulator shown has joints J1 and J2 drawn as pin/circle joints. What type of joints are they?", options: ["Prismatic (sliding)", "Revolute (rotary)", "Spherical (ball)", "Fixed (no motion)"], correct: 1 },
  { category: "Microcontrollers", difficulty: "medium", image: "/diagrams/h-bridge.svg", question: "The circuit shown drives motor M through four switches S1–S4. What is this H-bridge primarily used for?", options: ["Converting analog signals to digital", "Controlling the motor's direction (and speed via PWM)", "Measuring the motor temperature", "Storing the program firmware"], correct: 1 },
  { category: "Control Theory", difficulty: "medium", image: "/diagrams/pid-loop.svg", question: "In the control diagram, the '+' on reference r and '-' on the return path at the summing junction (Σ) indicate what kind of feedback?", options: ["Positive feedback", "Negative feedback", "Feedforward only", "Open-loop (no feedback)"], correct: 1 },
  { category: "Control Theory", difficulty: "easy", image: "/diagrams/pid-loop.svg", question: "In the block diagram shown, a PID control law would be implemented inside which block?", options: ["The plant P", "The controller C", "The summing junction (Σ)", "The feedback path"], correct: 1 },
  { category: "Kinematics", difficulty: "easy", image: "/diagrams/two-link-arm.svg", question: "The planar arm shown has two revolute joints moving in one plane. How many degrees of freedom (DOF) does it have?", options: ["1", "2", "3", "6"], correct: 1 },
  { category: "Kinematics", difficulty: "medium", image: "/diagrams/two-link-arm.svg", question: "For the arm shown, computing the end-effector position from the two joint angles (J1, J2) is called:", options: ["Inverse kinematics", "Forward kinematics", "Inverse dynamics", "Trajectory smoothing"], correct: 1 },
  { category: "Microcontrollers", difficulty: "medium", image: "/diagrams/h-bridge.svg", question: "In the H-bridge shown, turning ON the diagonal pair S1 and S4 (with S2 and S3 off) will:", options: ["Short the supply to ground", "Drive the motor in one direction", "Only brake the motor", "Have no effect on the motor"], correct: 1 },
  { category: "Microcontrollers", difficulty: "hard", image: "/diagrams/h-bridge.svg", question: "In the H-bridge shown, switching ON S1 and S2 (both switches on the same side) at the same time would:", options: ["Reverse the motor safely", "Short V+ to GND (shoot-through)", "Double the motor torque", "Filter electrical noise"], correct: 1 },
];
