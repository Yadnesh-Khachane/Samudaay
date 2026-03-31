
import { DB, Vendor, Investor, Job, JobSeeker, JobApplication, Investment, Transaction, Notification, SupportTicket, TeamMember, SubscriptionPlan } from "./db";

export function generateSeedData(): DB {
  const vendors: Vendor[] = [];
  const investors: Investor[] = [];
  const jobs: Job[] = [];
  const jobSeekers: JobSeeker[] = [];
  const jobApplications: JobApplication[] = [];
  const investments: Investment[] = [];
  const transactions: Transaction[] = [];
  const notifications: Notification[] = [];
  const tickets: SupportTicket[] = [];
  const team: TeamMember[] = [];
  const plans: SubscriptionPlan[] = [];

  const categories = ["Food", "Services", "Retail", "Beauty", "Manufacturing", "Tech", "Healthcare", "Education"];
  const locations = ["Andheri West", "Bandra East", "Worli", "Juhu", "Dadar", "Powai", "Kurla", "Colaba", "Borivali", "Vashi", "Thane"];
  const names = ["Amesh", "Sunil", "Priya", "Anita", "Rahul", "Kavya", "Suresh", "Meena", "Vikram", "Arjun", "Neha", "Saurabh", "Divya", "Aditya", "Sneha", "Rohan"];
  const businessPrefixes = ["Royal", "Green", "Urban", "Local", "Smart", "Global", "Direct", "Silver", "Golden", "Eco", "Pro", "Elite"];
  const businessSuffixes = ["Foods", "Services", "Retail", "Tech", "Labs", "Garage", "Studio", "Bakery", "Pharma", "Saloons", "Mart", "Center"];

  // Generate 80 Vendors
  for (let i = 1; i <= 80; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const owner = names[Math.floor(Math.random() * names.length)] + " " + names[Math.floor(Math.random() * names.length)];
    const business = businessPrefixes[Math.floor(Math.random() * businessPrefixes.length)] + " " + businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];
    const goal = Math.floor(Math.random() * 20) * 100000 + 300000;
    const raised = Math.floor(Math.random() * goal);
    
    vendors.push({
      id: i,
      name: business,
      owner,
      email: `${owner.toLowerCase().replace(" ", ".")}@${business.toLowerCase().replace(" ", "")}.com`,
      phone: `+91 98765 ${10000 + i}`,
      category,
      location,
      status: i % 10 === 0 ? "Pending" : "Verified",
      goal,
      raised,
      returns: `${Math.floor(Math.random() * 8) + 8}%`,
      tenure: `${(Math.floor(Math.random() * 3) + 1) * 12} mo`,
      investors: Math.floor(Math.random() * 50) + 10,
      description: `Premium ${category.toLowerCase()} services in ${location}. Providing value for over ${Math.floor(Math.random() * 10) + 2} years.`,
      gstNumber: `27AA${i < 10 ? '0' : ''}${i}CA1234A1Z${i % 9}`,
      bankAccount: `BANK-${1000000000 + i}`,
      joinedDate: "Oct 2024",
      documents: [],
      is_active: true,
      minInvest: 5000,
      maxInvest: 200000,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      walletBalance: Math.floor(Math.random() * 50000),
      updates: [],
      milestones: [],
      team: []
    });
  }

  // Generate 120 Jobs
  const jobTitles = ["Store Manager", "Delivery Executive", "Sales Associate", "Cashier", "Mechanic", "Technician", "Accountant", "Marketing lead", "Receptionist", "Chef", "Tailor", "Driver"];
  for (let i = 1; i <= 120; i++) {
    const vendorId = Math.floor(Math.random() * 80) + 1;
    const vendor = vendors[vendorId - 1];
    const type = ["Full-time", "Part-time", "Contract"][Math.floor(Math.random() * 3)];
    jobs.push({
      id: i,
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      business: vendor.name,
      vendorId,
      type,
      salary: `₹${Math.floor(Math.random() * 20) + 10},000–₹${Math.floor(Math.random() * 20) + 30},000`,
      location: vendor.location,
      posted: "Mar " + (Math.floor(Math.random() * 15) + 1),
      apps: Math.floor(Math.random() * 50),
      status: "Active",
      desc: "Join our growing team at " + vendor.name + ". We are looking for dedicated individuals.",
      requirements: "Experience in " + vendor.category + " preferred. Strong communication skills.",
      deadline: "Apr 2026",
      is_active: true
    });
  }

  // Generate 50 Investors
  for (let i = 1; i <= 50; i++) {
    const name = names[Math.floor(Math.random() * names.length)] + " " + names[Math.floor(Math.random() * names.length)];
    investors.push({
      id: i,
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      phone: `+91 99001 ${10000 + i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      totalInvested: 0,
      totalReturns: 0,
      portfolio: 0,
      status: "Active",
      joined: "Jan 2025",
      plan: i % 3 === 0 ? "Premium" : "Basic",
      panNumber: `ABCDE${1000 + i}F`,
      bankAccount: `HDFC-${2000000000 + i}`,
      kycStatus: "Verified",
      documents: [],
      is_active: true
    });
  }

  // Generate 150 Investments & Transactions
  for (let i = 1; i <= 150; i++) {
    const investorId = Math.floor(Math.random() * 50) + 1;
    const vendorId = Math.floor(Math.random() * 80) + 1;
    const amount = (Math.floor(Math.random() * 10) + 1) * 10000;
    const date = "Jan " + (Math.floor(Math.random() * 25) + 1) + ", 2025";
    
    investments.push({
      id: `inv_${i}`,
      investorId,
      vendorId,
      amount,
      txnId: `TXN-${20000000 + i}`,
      paymentMethod: "UPI",
      date,
      status: "Active",
      returnsEarned: Math.floor(amount * 0.05),
      nextPayout: "May 1, 2026",
      tenureMonths: 12,
      completedMonths: 3
    });

    transactions.push({
      id: `txn_${i}`,
      investorId,
      vendorId,
      vendorName: vendors[vendorId - 1].name,
      type: "Investment",
      amount,
      date,
      status: "Success",
      txnId: `TXN-${20000000 + i}`,
      paymentMethod: "UPI"
    });

    // Update investor totals
    const inv = investors[investorId - 1];
    inv.totalInvested += amount;
    inv.portfolio += 1;
  }

  // Generate 60 Job Seekers
  for (let i = 1; i <= 60; i++) {
    const name = names[Math.floor(Math.random() * names.length)] + " " + names[Math.floor(Math.random() * names.length)];
    jobSeekers.push({
      id: i,
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@jobseeker.com`,
      phone: `+91 99887 ${10000 + i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      skills: "Retail, Operations, MS Office",
      experience: `${Math.floor(Math.random() * 5) + 1} years`,
      status: "Active",
      appliedJobs: 0,
      joinedDate: "Feb 2025",
      currentRole: "Job Seeker",
      education: "Graduate",
      documents: [],
      is_active: true
    });
  }

  // Generate 200 Notifications
  for (let i = 1; i <= 200; i++) {
    const userType = Math.random() > 0.5 ? "investor" : "jobseeker";
    const userId = Math.floor(Math.random() * (userType === "investor" ? 50 : 60)) + 1;
    notifications.push({
      id: `notif_${i}`,
      userId,
      userType,
      title: ["Investment Alert", "New Job Match", "Payment Received", "KYC Update"][Math.floor(Math.random() * 4)],
      message: "This is a detailed notification about your account activity.",
      type: "alert",
      read: Math.random() > 0.7,
      date: "Mar 2025"
    });
  }

  // Pre-populate with fixed some data
  team.push(
    { id: 1, name: "Aditya Kapoor", role: "CEO", email: "aditya@samudaay.com", phone: "+91 98765 90001", dept: "Leadership", status: "Active", joined: "Jan 2024", permissions: ["ALL"], is_active: true },
    { id: 2, name: "Sneha Joshi", role: "CTO", email: "sneha@samudaay.com", phone: "+91 98765 90002", dept: "Engineering", status: "Active", joined: "Jan 2024", permissions: ["ALL"], is_active: true }
  );

  plans.push(
    { id: 1, name: "Vendor Pro", price: "2499", billingCycle: "monthly", features: ["Unlimited Job Postings", "Verified Badge", "Priority Placement"], active: true, subscriberCount: 42 },
    { id: 2, name: "Investor Basic", price: "0", billingCycle: "free", features: ["Access to all campaigns", "Tax reports"], active: true, subscriberCount: 1540 }
  );

  return {
    vendors,
    investors,
    investments,
    transactions,
    jobSeekers,
    jobApplications,
    jobs,
    tickets,
    team,
    plans,
    notifications,
    lastUpdated: new Date().toISOString()
  };
}
