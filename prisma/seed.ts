import pkg from '@prisma/client';
const { PrismaClient, PropertyType, PropertyStatus, UserRole, UserStatus, RoomStatus, BookingStatus, TaskPriority, TaskStatus, WorkflowStatus } = pkg;
import type { Department, User } from '@prisma/client';



const prisma = new PrismaClient();

const DEMO_PASSWORD_HASH = '$2a$12$R9hkaNzS9bUPhX.q5r8uFeJgG/v1xHqAqyV6mE3n3K3W/yN4W7K1e';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Delete existing data to prevent duplicate primary key conflicts on multiple runs
  await prisma.notification.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.aIRecommendation.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.guest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.sOPTaskTemplate.deleteMany({});
  await prisma.sOP.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.property.deleteMany({});

  // 1. Create Default Property
  const property = await prisma.property.create({
    data: {
      name: 'Grand Horizon Resort & Spa',
      type: PropertyType.RESORT,
      address: '100 Ocean Breeze Drive, Paradise Valley',
      timezone: 'Asia/Kolkata',
      status: PropertyStatus.ACTIVE,
      twilioWhatsappNumber: '+15550192834',
      twilioSmsNumber: '+15550192834',
      twilioPhoneNumber: '+15550192834',
    },
  });
  console.log(`🏠 Created Property: ${property.name} (${property.id})`);

  // 2. Create Departments
  const departmentNames = [
    { name: 'Management', desc: 'Hotel administration, oversight, and reporting' },
    { name: 'Reception', desc: 'Front desk, check-ins, guest inquiries, and cashiering' },
    { name: 'Housekeeping', desc: 'Room cleaning, laundry, and linen management' },
    { name: 'Kitchen', desc: 'Food preparation and kitchen inventory management' },
    { name: 'Restaurant', desc: 'Dining area, table booking coordination, and food service' },
    { name: 'Maintenance', desc: 'Equipment repair, facility checks, and asset maintenance' },
    { name: 'Security', desc: 'Property patrols, access control, and safety standard checks' },
    { name: 'Procurement', desc: 'Inventory restocks, vendor purchase requests, and deliveries' },
  ];

  const departments: Record<string, Department> = {};
  for (const dept of departmentNames) {
    departments[dept.name] = await prisma.department.create({
      data: {
        propertyId: property.id,
        name: dept.name,
        description: dept.desc,
        active: true,
      },
    });
  }
  console.log(`🏢 Created ${Object.keys(departments).length} Departments`);

  // 3. Create Employees (Users)
  const employeeData = [
    { name: 'Elena Rostova', email: 'owner@grandhorizon.com', role: UserRole.OWNER, dept: 'Management' },
    { name: 'Marcus Vance', email: 'manager@grandhorizon.com', role: UserRole.MANAGER, dept: 'Management' },
    { name: 'Sarah Jenkins', email: 'supervisor@grandhorizon.com', role: UserRole.SUPERVISOR, dept: 'Reception' },
    { name: 'David Kim', email: 'receptionist@grandhorizon.com', role: UserRole.RECEPTIONIST, dept: 'Reception' },
    { name: 'Maria Gomez', email: 'housekeeper.lead@grandhorizon.com', role: UserRole.SUPERVISOR, dept: 'Housekeeping' },
    { name: 'John Doe', email: 'housekeeper@grandhorizon.com', role: UserRole.HOUSEKEEPER, dept: 'Housekeeping' },
    { name: 'Chef Sanjay', email: 'chef@grandhorizon.com', role: UserRole.CHEF, dept: 'Kitchen' },
    { name: 'Robert Miller', email: 'technician@grandhorizon.com', role: UserRole.TECHNICIAN, dept: 'Maintenance' },
    { name: 'Alex Thompson', email: 'driver@grandhorizon.com', role: UserRole.DRIVER, dept: 'Reception' },
    { name: 'Alice Smith', email: 'staff@grandhorizon.com', role: UserRole.STAFF, dept: 'Procurement' },
  ];

  const users: Record<string, User> = {};
  for (const emp of employeeData) {
    users[emp.role] = await prisma.user.create({
      data: {
        propertyId: property.id,
        departmentId: departments[emp.dept].id,
        name: emp.name,
        email: emp.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: emp.role,
        status: UserStatus.ACTIVE,
      },
    });
  }
  console.log(`👥 Created ${employeeData.length} Users/Employees`);

  // 4. Create 20 Rooms
  const rooms = [];
  // Standard Rooms (101 - 110)
  for (let i = 1; i <= 10; i++) {
    const room = await prisma.room.create({
      data: {
        propertyId: property.id,
        roomNumber: `10${i}`,
        roomType: 'Standard Ocean View',
        status: RoomStatus.AVAILABLE,
      },
    });
    rooms.push(room);
  }
  // Deluxe Rooms (201 - 210)
  for (let i = 1; i <= 10; i++) {
    const room = await prisma.room.create({
      data: {
        propertyId: property.id,
        roomNumber: `20${i}`,
        roomType: 'Deluxe Suite',
        status: RoomStatus.AVAILABLE,
      },
    });
    rooms.push(room);
  }
  console.log(`🛏️ Created 20 Rooms`);

  // 5. Create Sample Guests
  const guest1 = await prisma.guest.create({
    data: {
      propertyId: property.id,
      name: 'Arthur Pendragon',
      phone: '+15550192834',
      email: 'arthur.p@camelot.org',
      preferences: 'Prefers high floors, feather-free pillows, and sparkling water.',
      loyaltyStatus: 'Gold',
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      propertyId: property.id,
      name: 'Morgana Le Fay',
      phone: '+15550192777',
      email: 'morgana.lf@darkmagic.co',
      preferences: 'Prefers early check-in and strong black coffee.',
      loyaltyStatus: 'Silver',
    },
  });
  console.log('👤 Created Sample Guests');

  // 6. Create Bookings
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() - 1);
  const checkOutDate = new Date();
  checkOutDate.setDate(checkOutDate.getDate() + 3);

  const booking1 = await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestId: guest1.id,
      roomId: rooms[0].id, // Room 101
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: BookingStatus.CHECKED_IN,
    },
  });
  await prisma.room.update({
    where: { id: rooms[0].id },
    data: { status: RoomStatus.OCCUPIED },
  });

  const booking2 = await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestId: guest2.id,
      roomId: rooms[10].id, // Room 201
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: BookingStatus.CHECKED_IN,
    },
  });
  await prisma.room.update({
    where: { id: rooms[10].id },
    data: { status: RoomStatus.OCCUPIED },
  });
  console.log('📅 Created Bookings');

  // 7. Create Sample Inventory
  const inventoryItems = [
    { name: 'Fresh Whole Milk', unit: 'litres', qty: 4, minLevel: 10, dept: 'Kitchen' },
    { name: 'Hotel Toiletries Kit', unit: 'units', qty: 150, minLevel: 50, dept: 'Housekeeping' },
    { name: 'Premium Cotton Towels', unit: 'units', qty: 12, minLevel: 30, dept: 'Housekeeping' },
    { name: 'Eco Soap Bar (50g)', unit: 'units', qty: 25, minLevel: 100, dept: 'Housekeeping' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        propertyId: property.id,
        departmentId: departments[item.dept].id,
        name: item.name,
        unit: item.unit,
        quantity: item.qty,
        minimumLevel: item.minLevel,
      },
    });
  }
  console.log('📦 Seeded Inventory Items');

  // 8. Create Vendors
  const vendors = [
    { name: 'Paradise Dairy Farms', category: 'F&B Supplies', contact: 'order@paradisedairy.com' },
    { name: 'Linen Master Services', category: 'Laundry & Textiles', contact: 'support@linenmasters.com' },
  ];

  for (const vendor of vendors) {
    await prisma.vendor.create({
      data: {
        propertyId: property.id,
        name: vendor.name,
        category: vendor.category,
        contactInfo: vendor.contact,
      },
    });
  }

  // 9. Create Assets
  const assets = [
    { name: 'Emergency Backup Generator (300 kVA)', category: 'Power Systems', status: 'OPERATIONAL' },
    { name: 'Lobby Central AC Chiller Group A', category: 'HVAC', status: 'OPERATIONAL' },
  ];

  for (const asset of assets) {
    await prisma.asset.create({
      data: {
        propertyId: property.id,
        name: asset.name,
        category: asset.category,
        status: asset.status,
      },
    });
  }

  // 10. SOP Templates
  const sop1 = await prisma.sOP.create({
    data: {
      propertyId: property.id,
      name: 'Daily Morning Opening SOP',
      schedule: '0 7 * * *',
      active: true,
    },
  });

  await prisma.sOPTaskTemplate.createMany({
    data: [
      {
        sopId: sop1.id,
        departmentId: departments['Reception'].id,
        title: 'Verify Cash Floating Register',
        description: 'Count cash register drawer and log starting floating cash (Target: $500).',
        priority: TaskPriority.MEDIUM,
      },
      {
        sopId: sop1.id,
        departmentId: departments['Housekeeping'].id,
        title: 'Check Daily VIP Arrival Report',
        description: 'Review bookings list for VIP tags and coordinate prep times.',
        priority: TaskPriority.HIGH,
      },
    ],
  });

  // 11. Create Workflows & Tasks
  const workflow1 = await prisma.workflow.create({
    data: {
      propertyId: property.id,
      bookingId: booking1.id,
      type: 'GUEST_REQUEST',
      status: WorkflowStatus.IN_PROGRESS,
    },
  });

  const task1 = await prisma.task.create({
    data: {
      propertyId: property.id,
      workflowId: workflow1.id,
      departmentId: departments['Housekeeping'].id,
      assignedUserId: users[UserRole.HOUSEKEEPER].id, // John Doe
      roomId: rooms[0].id,
      title: 'Deliver 2 Fresh Pool Towels',
      description: 'Guest Arthur Pendragon requested 2 additional towels in Room 101. Deliver immediately.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 20 * 60 * 1000),
    },
  });

  const workflow2 = await prisma.workflow.create({
    data: {
      propertyId: property.id,
      type: 'MAINTENANCE',
      status: WorkflowStatus.PENDING,
    },
  });

  await prisma.task.create({
    data: {
      propertyId: property.id,
      workflowId: workflow2.id,
      departmentId: departments['Maintenance'].id,
      assignedUserId: users[UserRole.TECHNICIAN].id,
      title: 'Investigate Elevator Chattering Noise',
      description: 'Report from security that South Wing Elevator A is making grinding sounds.',
      priority: TaskPriority.URGENT,
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const workflow3 = await prisma.workflow.create({
    data: {
      propertyId: property.id,
      type: 'INVENTORY_REFILL',
      status: WorkflowStatus.IN_PROGRESS,
    },
  });

  await prisma.task.create({
    data: {
      propertyId: property.id,
      workflowId: workflow3.id,
      departmentId: departments['Procurement'].id,
      title: 'Restock Milk Supplies',
      description: 'Milk quantity is at 4 litres, which is below the minimum threshold of 10 litres.',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.ESCALATED,
      dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  const workflow4 = await prisma.workflow.create({
    data: {
      propertyId: property.id,
      bookingId: booking2.id,
      type: 'GUEST_REQUEST',
      status: WorkflowStatus.COMPLETED,
    },
  });

  await prisma.task.create({
    data: {
      propertyId: property.id,
      workflowId: workflow4.id,
      departmentId: departments['Reception'].id,
      assignedUserId: users[UserRole.RECEPTIONIST].id,
      title: 'Welcome Drink Service Room 201',
      description: 'Guest Morgana requested welcome drink on arrival.',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.COMPLETED,
      dueDate: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      propertyId: property.id,
      taskId: task1.id,
      userId: users[UserRole.HOUSEKEEPER].id,
      message: 'On my way to the linen closet now. Will deliver in 5 minutes.',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      propertyId: property.id,
      type: 'STAFF_MOVE',
      confidence: 0.92,
      reason: 'Linen request volume for Housekeeping is 40% above normal daily averages for Monday afternoons. Recommend shifting 1 member from Reception to assist.',
      status: 'PENDING',
    },
  });

  console.log('🌿 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
