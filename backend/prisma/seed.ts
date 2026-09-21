import { PrismaClient, Role, ProjectStatus, TaskStatus, TaskPriority, ActivityAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 2. Seed Users: 1 Admin, 2 PMs, 4 Developers
  const admin = await prisma.user.create({
    data: {
      name: 'Ravi Sharma',
      email: 'admin@velozity.com',
      passwordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'pm1@velozity.com',
      passwordHash,
      role: Role.PROJECT_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Michael Chang',
      email: 'pm2@velozity.com',
      passwordHash,
      role: Role.PROJECT_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'dev1@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'dev2@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'dev3@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'dev4@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  console.log('✅ Created 1 Admin, 2 Project Managers, 4 Developers.');

  // 3. Seed Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Jonathan Sterling',
      company: 'Acme Corporation',
      email: 'j.sterling@acme.com',
      phone: '+1 (555) 234-5678',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Clara Vance',
      company: 'Nova Fintech',
      email: 'clara@novafintech.io',
      phone: '+1 (555) 876-5432',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Marcus Brody',
      company: 'Zenith Global Retail',
      email: 'marcus@zenithretail.com',
      phone: '+1 (555) 345-9876',
    },
  });

  console.log('✅ Created 3 Clients.');

  // 4. Seed Projects (PM1 manages 2 projects, PM2 manages 1 project)
  const project1 = await prisma.project.create({
    data: {
      name: 'Acme Cloud Migration & API Modernization',
      description: 'Enterprise migration of legacy monolithic core to containerized microservices on AWS EKS with zero-downtime cutover.',
      status: ProjectStatus.ACTIVE,
      clientId: client1.id,
      managerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Nova Mobile Banking Portal 2.0',
      description: 'Next-gen mobile banking app featuring biometric auth, instant ledger sync, and compliance telemetry.',
      status: ProjectStatus.ACTIVE,
      clientId: client2.id,
      managerId: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Zenith Omnichannel Checkout Redesign',
      description: 'High-conversion checkout experience integrated with Stripe 3D Secure, Apple Pay, and automated inventory sync.',
      status: ProjectStatus.ACTIVE,
      clientId: client3.id,
      managerId: pm2.id,
    },
  });

  console.log('✅ Created 3 Projects with client linkages.');

  // 5. Seed Tasks: 6 tasks per project (Total 18 tasks), including at least 2 in OVERDUE state
  const now = new Date();
  const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const pastFiveDays = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const futureTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const futureFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const futureSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const futureTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Project 1 Tasks (Managed by PM1 - Sarah)
  const p1Tasks = [
    {
      taskNumber: 1,
      title: 'Audit current legacy microservices architecture',
      description: 'Document dependencies, database bottlenecks, and network latency profiles across monolithic services.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastThreeDays,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 2,
      title: 'Provision Kubernetes cluster on AWS EKS',
      description: 'Setup Terraform scripts for multi-AZ worker node groups, VPC peering, and IAM roles for service accounts.',
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: futureTwoDays,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev2.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 3,
      title: 'Implement JWT dual-token authentication gateway',
      description: 'Setup access token verification middleware, HttpOnly cookie refresh handling, and token rotation blacklist in Redis.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureFourDays,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 4,
      title: 'Containerize user billing and invoicing service',
      description: 'Create multi-stage Dockerfile, configure alpine linux base image, and setup non-root execution context.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureSevenDays,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev2.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 5,
      title: 'Load testing and disaster recovery simulation',
      description: 'Execute k6 load scenarios up to 25,000 req/sec to ensure sub-50ms latency across API endpoints.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureTwoWeeks,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev3.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 6,
      title: 'Configure SSL termination and custom domain ingress',
      description: 'Set up cert-manager with Let\'s Encrypt DNS01 challenge validation and configure NGINX ingress controller.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: pastThreeDays, // OVERDUE TASK 1
      isOverdue: true,
      projectId: project1.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
    },
  ];

  // Project 2 Tasks (Managed by PM1 - Sarah)
  const p2Tasks = [
    {
      taskNumber: 7,
      title: 'Design biometric authentication flow (FaceID & Fingerprint)',
      description: 'Wireframe iOS LocalAuthentication and Android BiometricPrompt security handshakes.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastThreeDays,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 8,
      title: 'Implement real-time transaction webhook consumer',
      description: 'Process incoming ledger events with idempotency keys and exponential backoff retry logic.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureTwoDays,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 9,
      title: 'Security vulnerability penetration test and remediation',
      description: 'Run automated OWASP dependency checks and static code security scans.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureFourDays,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev3.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 10,
      title: 'Plaid API integration for account sync',
      description: 'Connect user financial accounts through Plaid Link SDK with webhook status listeners.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureSevenDays,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 11,
      title: 'Compliance reporting export module (GDPR & PCI-DSS)',
      description: 'Build cryptographic log auditor and downloadable encrypted CSV archive report generator.',
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastFiveDays, // OVERDUE TASK 2
      isOverdue: true,
      projectId: project2.id,
      assignedToId: dev4.id,
      createdById: pm1.id,
    },
    {
      taskNumber: 12,
      title: 'Customer onboarding multi-step verification wizard',
      description: 'Implement KYC verification form with document photo upload and instant validation.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastThreeDays,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev2.id,
      createdById: pm1.id,
    },
  ];

  // Project 3 Tasks (Managed by PM2 - Michael)
  const p3Tasks = [
    {
      taskNumber: 13,
      title: 'Stripe checkout session integration with 3D Secure',
      description: 'Integrate Stripe Elements with SCA protocol and handle asynchronous webhook outcomes.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureTwoDays,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id,
      createdById: pm2.id,
    },
    {
      taskNumber: 14,
      title: 'Cart persistence and abandoned cart recovery trigger',
      description: 'Persist guest carts in encrypted local storage and sync to database upon customer sign-in.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureSevenDays,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev3.id,
      createdById: pm2.id,
    },
    {
      taskNumber: 15,
      title: 'Inventory sync engine with ERP webhook receiver',
      description: 'Synchronize SKU stock levels within 500ms of warehouse order processing.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureFourDays,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev4.id,
      createdById: pm2.id,
    },
    {
      taskNumber: 16,
      title: 'Discount codes and promotional coupon validator',
      description: 'Build coupon validation engine with max redemption limits and minimum order amounts.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastThreeDays,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev1.id,
      createdById: pm2.id,
    },
    {
      taskNumber: 17,
      title: 'Automated end-to-end Cypress checkout tests',
      description: 'Create test suites covering single-item purchase, bulk cart checkout, and payment failure edge cases.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureTwoWeeks,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id,
      createdById: pm2.id,
    },
    {
      taskNumber: 18,
      title: 'Optimize checkout page Core Web Vitals to score 95+',
      description: 'Eliminate render-blocking resources, preconnect payment CDNs, and reduce cumulative layout shifts.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureSevenDays,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev3.id,
      createdById: pm2.id,
    },
  ];

  const createdTasks: any[] = [];
  for (const t of [...p1Tasks, ...p2Tasks, ...p3Tasks]) {
    const task = await prisma.task.create({ data: t });
    createdTasks.push(task);
  }

  console.log(`✅ Created ${createdTasks.length} tasks across 3 projects with 2 confirmed overdue tasks.`);

  // 6. Seed Pre-existing Activity Log Entries (so feed is rich on first load)
  const activities = [
    {
      taskId: createdTasks[2].id, // Task 3
      projectId: project1.id,
      userId: dev1.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.IN_REVIEW,
      message: 'Alex Rivera moved Task #3 from In Progress → In Review',
      createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 mins ago
    },
    {
      taskId: createdTasks[5].id, // Task 6
      projectId: project1.id,
      userId: null,
      action: ActivityAction.TASK_OVERDUE,
      message: 'System flagged Task #6 "Configure SSL termination and custom domain ingress" as Overdue',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
    },
    {
      taskId: createdTasks[8].id, // Task 9
      projectId: project2.id,
      userId: dev3.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.IN_REVIEW,
      message: 'David Kim moved Task #9 from In Progress → In Review',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
    },
    {
      taskId: createdTasks[10].id, // Task 11
      projectId: project2.id,
      userId: null,
      action: ActivityAction.TASK_OVERDUE,
      message: 'System flagged Task #11 "Compliance reporting export module (GDPR & PCI-DSS)" as Overdue',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hr ago
    },
    {
      taskId: createdTasks[14].id, // Task 15
      projectId: project3.id,
      userId: dev4.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.IN_REVIEW,
      message: 'Priya Patel moved Task #15 from In Progress → In Review',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hrs ago
    },
    {
      taskId: createdTasks[11].id, // Task 12
      projectId: project2.id,
      userId: dev2.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.DONE,
      message: 'Elena Rostova moved Task #12 from In Progress → Done',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hrs ago
    },
    {
      taskId: createdTasks[0].id, // Task 1
      projectId: project1.id,
      userId: dev1.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.DONE,
      message: 'Alex Rivera moved Task #1 from In Progress → Done',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hrs ago
    },
    {
      taskId: createdTasks[1].id, // Task 2
      projectId: project1.id,
      userId: dev2.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.DONE,
      message: 'Elena Rostova moved Task #2 from In Progress → Done',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hrs ago
    },
    {
      taskId: createdTasks[6].id, // Task 7
      projectId: project2.id,
      userId: dev4.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.DONE,
      message: 'Priya Patel moved Task #7 from In Progress → Done',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      taskId: createdTasks[15].id, // Task 16
      projectId: project3.id,
      userId: dev1.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.IN_PROGRESS,
      toStatus: TaskStatus.DONE,
      message: 'Alex Rivera moved Task #16 from In Progress → Done',
      createdAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
    },
    {
      taskId: createdTasks[12].id, // Task 13
      projectId: project3.id,
      userId: pm2.id,
      action: ActivityAction.TASK_CREATED,
      message: 'Michael Chang created Task #13: "Stripe checkout session integration with 3D Secure"',
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      taskId: createdTasks[7].id, // Task 8
      projectId: project2.id,
      userId: dev4.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.TODO,
      toStatus: TaskStatus.IN_PROGRESS,
      message: 'Priya Patel moved Task #8 from To Do → In Progress',
      createdAt: new Date(now.getTime() - 9 * 60 * 60 * 1000),
    },
    {
      taskId: createdTasks[3].id, // Task 4
      projectId: project1.id,
      userId: dev2.id,
      action: ActivityAction.STATUS_CHANGE,
      fromStatus: TaskStatus.TODO,
      toStatus: TaskStatus.IN_PROGRESS,
      message: 'Elena Rostova moved Task #4 from To Do → In Progress',
      createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  console.log(`✅ Created ${activities.length} activity log entries with formatted messages.`);

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: pm1.id,
        taskId: createdTasks[2].id,
        type: NotificationType.TASK_IN_REVIEW,
        title: 'Task Ready for Review',
        message: 'Task #3 "Implement JWT dual-token authentication gateway" was moved to In Review by Alex Rivera',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        userId: dev1.id,
        taskId: createdTasks[5].id,
        type: NotificationType.TASK_OVERDUE,
        title: 'Task Overdue Alert',
        message: 'Task #6 "Configure SSL termination and custom domain ingress" is past its due date.',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        userId: dev4.id,
        taskId: createdTasks[10].id,
        type: NotificationType.TASK_OVERDUE,
        title: 'Task Overdue Alert',
        message: 'Task #11 "Compliance reporting export module (GDPR & PCI-DSS)" is past its due date.',
        isRead: false,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        userId: pm2.id,
        taskId: createdTasks[14].id,
        type: NotificationType.TASK_IN_REVIEW,
        title: 'Task Ready for Review',
        message: 'Task #15 "Inventory sync engine with ERP webhook receiver" was moved to In Review by Priya Patel',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: dev1.id,
        taskId: createdTasks[2].id,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: 'Sarah Jenkins assigned you Task #3: "Implement JWT dual-token authentication gateway"',
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created realistic initial notifications.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
