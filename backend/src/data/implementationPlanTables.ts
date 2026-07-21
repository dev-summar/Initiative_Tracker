/**
 * Key areas from Strategic Plan Implementation Plan tables (Tables 7–13).
 * Each row mirrors: Key Area | Deliverables | Owner | Timelines | Justification
 */
import type { PlanItemSeed } from './strategicPlanData.js'

type TableSeed = { planId: string; tableRef: string; items: PlanItemSeed[] }

export const IMPLEMENTATION_PLAN_TABLES: TableSeed[] = [
  {
    planId: 'plan-ld',
    tableRef: 'Strategic Plan — Table 7: Learning and Development',
    items: [
      { title: 'Identify Learning Platforms', description: 'Select platforms like Coursera, Infosys SpringBoard, Nasscom Future Skills Prime.', processOwner: 'HRD', phase: 'Phase 1: 3 Months' },
      { title: 'Build Linkages with Training Service Providers', description: 'Collaborate with NVIDIA, AWS, Cisco, Palo Alto Networks, UiPath Academies, and empanelled training companies.', processOwner: 'Leadership Team, HRD', phase: 'Phase 1: 6 Months' },
      { title: 'Curate Learning Paths', description: 'Create department-specific and individual learning paths on Coursera; optional and mandatory courses aligned with R&D goals.', processOwner: 'HRD, Department Heads', phase: 'Phase 1: 6 Months' },
      { title: 'Individual Development Plans (IDPs)', description: 'Develop IDPs in PI-360 to track learning outcomes and continuous progress.', processOwner: 'HRD', phase: 'Phase 1: 6 Months' },
      { title: 'Mentoring', description: '1x1 faculty mentoring for publications, grant applications, and IPR.', processOwner: 'Senior Faculty, HRD', phase: 'Phase 2: Ongoing' },
      { title: 'Group/Team Learning', description: 'Facilitate peer learning for faculty with similar learning paths.', processOwner: 'HRD, Department Heads', phase: 'Phase 2: 6 Months' },
      { title: 'L&D Calendar', description: 'Comprehensive L&D plan/calendar with tracking deliverables and milestones.', processOwner: 'HRD', phase: 'Phase 1: 3 Months' },
      { title: 'L&D Spaces and Environments', description: 'Setup Teaching-Learning Centre with dedicated learning spaces.', processOwner: 'Facilities Team, HRD', phase: 'Phase 2: 1 Year' },
      { title: 'Track Progress', description: 'Conduct half-yearly reviews, monthly progress reports, and performance appraisals using IDPs and progress metrics.', processOwner: 'HRD', phase: 'Phase 2: Ongoing' },
      { title: 'Learning Success Managers', description: 'Appoint central HRD and Learning Champions to monitor and ensure learning success.', processOwner: 'HRD', phase: 'Phase 1: 3-6 Months' },
      { title: 'Identify Learning Champions', description: 'Recognize and empower faculty who exemplify continuous learning; recognition programs for high achievers.', processOwner: 'HRD', phase: 'Phase 2: 1 Year' },
      { title: 'Incentivize and Celebrate Learning', description: 'Develop incentive plans for fast learners and learning champions; rewards for milestones and innovation.', processOwner: 'HRD', phase: 'Phase 3: 2 Years' },
    ],
  },
  {
    planId: 'plan-rdi',
    tableRef: 'Strategic Plan — Table 8: Research, Development & Innovation',
    items: [
      { title: 'Operationalise PhD Program', description: 'Start PhD by August 2025; proposal and formalities with University of Jammu.', processOwner: 'Leadership Team', phase: 'Phase 1' },
      { title: 'Center for AI, Quantum Computing, and Emerging Technologies', description: 'State-of-the-art labs, interdisciplinary research teams, collaborative projects.', processOwner: 'RIC', phase: 'Phase 1 (1 Year): Establishment' },
      { title: 'Revise Research Incentives', description: 'Revised incentive policies; increased funding for publications and patents.', processOwner: 'HR Department', phase: 'Phase 1 (6 Months): Policy Review' },
      { title: 'In-House Workshops for Faculty', description: 'Workshops on research methodologies, grant writing, and publication strategies.', processOwner: 'RIC', phase: 'Phase 1 (6 Months): Curriculum Development' },
      { title: 'L&D Plans for Faculty Domain Expertise', description: 'Personalized L&D plans and mentorship programs for research capability.', processOwner: 'HRD', phase: 'Phase 1 (1 Year): Assessment' },
      { title: 'IPR Center', description: 'IPR policies, patent filing support, and legal assistance.', processOwner: 'RIC', phase: 'Phase 1 (1 Year): Establishment' },
      { title: 'Tinkering Lab', description: 'Modern fabrication facilities — IoT/Sensors, 3D printers, CNC, PCB fabrication, electronics workbenches.', processOwner: 'RIC', phase: 'Phase 1 (1 Year)' },
      { title: 'Increase SEED Grant Funding', description: 'Boost initial funding for innovative student and faculty projects.', processOwner: 'RIC', phase: 'Phase 1' },
      { title: 'External Funding and Grants', description: 'Identify funding opportunities; application and project management for grants.', processOwner: 'RIC', phase: 'Phase 2 (2 Years)' },
      { title: 'UNSDG-Aligned Research', description: 'Prioritize research projects aligned with UN Sustainable Development Goals.', processOwner: 'RIC', phase: 'Phase 1' },
      { title: 'Incubator for Campus Startups', description: 'Incubation setup, resources, and support services for campus startups.', processOwner: 'RIC', phase: 'Phase 1 (1 Year)' },
      { title: 'KRAs and Tracking for Research', description: 'Departmental research KRAs, weekly touch-base, and accountability tracking.', processOwner: 'RIC', phase: 'Phase 1 (6 Months)' },
    ],
  },
  {
    planId: 'plan-digital',
    tableRef: 'Strategic Plan — Table 9: Digital Transformation',
    items: [
      { title: 'High-Speed Internet Connectivity', description: 'Achieve 1 Gbps internet connectivity across campus.', processOwner: 'IT Department', phase: 'Phase 1 (6 Months): Vendor Selection' },
      { title: 'State-of-the-Art Computing Facilities', description: 'Advanced computing facilities for AI and emerging technologies.', processOwner: 'IT Department', phase: 'Phase 1 (6 Months): Planning' },
      { title: 'Smart Classrooms', description: 'Equip classrooms with smart boards and audio-video systems.', processOwner: 'Facilities and IT Department', phase: 'Phase 1 (1 Year): Planning' },
      { title: 'Modern Communication Backbone', description: '100% fibre network, VPNs, VoIP, Wi-Fi, digital display systems on cloud.', processOwner: 'IT Department', phase: 'Phase 1 (1 Year): Infrastructure Planning' },
      { title: 'Cloud-First Strategy', description: 'Adopt cloud-based solutions for email and data management.', processOwner: 'IT Department', phase: 'Phase 1 (6 Months): Vendor Evaluation' },
      { title: 'Automation of Institutional Operations', description: 'IT systems for automation from admissions to alumni management (PI-360).', processOwner: 'Leadership Team and IT Department', phase: 'Phase 1 (6 Months): Requirement Analysis' },
      { title: 'Modern Lab Infrastructure', description: 'Equip labs with modern computing infrastructure and latest software platforms.', processOwner: 'IT Department and Academic Departments', phase: 'Phase 1 (6 Months): Needs Assessment' },
      { title: 'Open-Source Adoption', description: 'Champion open-source tools and platforms where feasible.', processOwner: 'IT Department and Academic Departments', phase: 'Phase 1 (6 Months): Evaluation' },
      { title: 'Advanced Security Provisions', description: 'Advanced security measures for data protection and seamless operations.', processOwner: 'IT Department', phase: 'Phase 1 (6 Months): Security Assessment' },
      { title: 'BYOD Policy', description: 'Develop policies around Bring-Your-Own-Device for stakeholder productivity.', processOwner: 'HR and IT Department', phase: 'Phase 1 (6 Months): Policy Development' },
      { title: 'E-Waste Disposal and Deprecation', description: 'Dispose e-waste through registered recycling agencies; sustainable practices.', processOwner: 'IT Department', phase: 'Phase 1 (Ongoing)' },
      { title: 'IT Audits and Continuous Upgradation', description: 'Conduct IT audits, risk assessments, and continuous maintenance/upgradation.', processOwner: 'IT Department', phase: 'Phase 1 (Ongoing)' },
    ],
  },
  {
    planId: 'plan-infra',
    tableRef: 'Strategic Plan — Table 10: Infrastructure Development',
    items: [
      { title: 'Physical Infrastructure', description: 'Master Plan, IT Park & Academic Building, Student Hostels and Faculty Housing, Furniture Upgrade, Gate Complex, Parking, Pantries, Art Installations, Landscaping and Beautification, Interior upgrade.', processOwner: 'Leadership Team', phase: 'Phase 1: 1 Year Design and Planning' },
      { title: 'Digital Infrastructure', description: 'Wi-Fi upgrade and utility enhancements across campus.', processOwner: 'IT/Facilities Department', phase: 'Phase 1: 6-12 months' },
      { title: 'Student and Faculty Amenities', description: 'Cafeteria, Gym, Pool, Stadium, Cultural Centre, Amphitheatre, Sporatorium.', processOwner: 'Leadership Team', phase: 'Phase 1: 1 Year Feasibility Studies' },
      { title: 'Support Services', description: 'Market, Water Bodies, Solar Power, Admin upgrade, Guest Houses, Shuttle Service, Medical Centre, Convocation.', processOwner: 'Facilities/IT Department', phase: 'Phase 1: 1 Year Infrastructure Planning' },
      { title: 'Accessibility and Inclusivity', description: 'Lifts, Ramps, Accessible Washrooms, Girls Common Room.', processOwner: 'Leadership Team / Facilities Department', phase: 'Phase 1: 6 Months Accessibility Audit' },
      { title: 'Academic and Support Facilities', description: 'Library Building, Health Insurance, Central Stores.', processOwner: 'Leadership Team', phase: 'Phase 1: 1 Year Design and Planning' },
    ],
  },
  {
    planId: 'plan-iqac',
    tableRef: 'Strategic Plan — Table 11: IQAC',
    items: [
      { title: 'Campus Experience', description: 'Cleanliness review, waste segregation, checklists, false ceilings, power supply, washrooms upgrading.', processOwner: 'IQAC / IT / Facilities', phase: 'Phase 1 (6 Months)' },
      { title: 'Sub-Staff Training', description: 'Training on workplace behavior, process training, uniforms for peons, security, and conservancy staff.', processOwner: 'IQAC / HRD', phase: 'Phase 1 (6 Months)' },
      { title: 'Workplace Safety', description: 'Fire safety training, extinguishers maintenance, safety certificates, emergency drills, medical facilities.', processOwner: 'IQAC / Facilities', phase: 'Phase 1 (6 Months): Safety Audit' },
      { title: 'Stakeholder Feedback', description: 'Collect feedback from all stakeholders, action taken reports, YoY analysis, communicate back.', processOwner: 'IQAC / HRD', phase: 'Phase 1 (6 Months): Data Collection' },
      { title: 'External Peer Team', description: 'Constitute team, prepare for visit, conduct visit, prepare report and action taken report.', processOwner: 'IQAC', phase: 'Phase 1 (1 Year): Calendar and Planning' },
      { title: 'Management Review Meetings', description: 'Set agenda, invite senior leadership, present reports, implement inputs.', processOwner: 'IQAC', phase: 'Phase 1 (3 Months): Agenda Setting' },
      { title: 'IQAC Reports in AC/GB', description: 'Comprehensive report based on KRAs; present highlights in Academic Council and Governing Body.', processOwner: 'IQAC', phase: 'Phase 1 (6 Months): Report Preparation' },
      { title: 'Audits', description: 'Green audits, IT audits, Academic and Administrative Audits for compliance.', processOwner: 'IQAC', phase: 'Phase 1 (1 Year): Calendar and Planning' },
      { title: 'Faculty Training', description: 'Internal/external training calendars, Coursera learning paths, industry certifications, FDP budget.', processOwner: 'HRD / IQAC', phase: 'Phase 1 (6 Months): Training Needs' },
      { title: 'Student Trainings', description: 'Induction/orientation, bridge programs, professional training, student support services including mental health helplines and counsellor availability; career counselling and international admissions facilitation.', processOwner: 'T&P / IQAC', phase: 'Phase 1 (6 Months): Curriculum Development + Training Delivery Plan' },
      { title: 'Faculty Mentoring', description: '1x1 mentoring by Director for performance and impact enhancement.', processOwner: 'IQAC / Leadership', phase: 'Phase 2: Ongoing' },
      { title: 'Alumni Mentoring', description: 'Structured alumni mentoring program; track outcomes and publish reports.', processOwner: 'IQAC / Alumni Cell', phase: 'Phase 1' },
      { title: 'Championing PI-360', description: 'Evangelize PI-360 and use data analytics for institutional decision making.', processOwner: 'IQAC / IT', phase: 'Phase 1' },
      { title: 'Mission NAAC', description: 'Attain high maturity level in the revised NAAC framework.', processOwner: 'IQAC', phase: 'Phase 2: Ongoing' },
      { title: 'Strategy Retreats and Planning', description: 'Conduct strategy retreats leading to high-quality 3-year plans across critical areas.', processOwner: 'IQAC / Leadership', phase: 'Phase 1 (6 Months)' },
    ],
  },
  {
    planId: 'plan-brand',
    tableRef: 'Strategic Plan — Table 12: Brand Enhancement',
    items: [
      { title: 'Alumni Engagement', description: 'Strengthen alumni connect through updates, reunions, networking; branded communication and success stories.', processOwner: 'Alumni Relations Cell', phase: 'Phase 1 (6 Months): Develop Alumni Portal' },
      { title: 'Stakeholder Experience Management', description: 'Appoint Experience Manager; regular feedback loops and satisfaction surveys.', processOwner: 'Administration / HRD', phase: 'Phase 1 (6 Months): Recruit Experience Manager' },
      { title: 'Skilling and Lifelong Learning', description: 'Centre for Skill Development — EVs, Drones, CPS, Factory Automation; certificate programs for professionals.', processOwner: 'Leadership Team', phase: 'Phase 1 (1 Year): Conceptualization' },
      { title: 'Community and Outreach Programs', description: 'Marquee events — conclaves, hackathons, forums; summer training for school students; senior citizen outreach.', processOwner: 'NSS, IQAC', phase: 'Phase 1 (6 Months): Event Planning' },
      { title: 'School and Student Engagement', description: 'Direct school engagement, open houses, CBSE teacher training in AI/ML and emerging technologies.', processOwner: 'Admissions Office', phase: 'Phase 1 (6 Months): Identify Key Schools' },
      { title: 'Marketing and Public Relations', description: 'Monthly PR calendar, mega quarterly activities, branding success stories across platforms.', processOwner: 'Leadership Team', phase: 'Phase 1 (3 Months): Calendar Setup' },
      { title: 'Thought Leadership and Policy Advocacy', description: 'Publish white papers, policy advocacy, panel discussions and external forums.', processOwner: 'Leadership Team', phase: 'Phase 1 (6 Months): Identify Key Areas' },
      { title: 'International Ranking and Accreditations', description: 'Participate in QS and Times Higher Education; explore ABET, AACSB; green initiatives.', processOwner: 'IQAC', phase: 'Phase 1 (6 Months): Prepare for Submissions' },
      { title: 'Scholarships and Financial Support', description: 'Scholarship test in founder\'s name; tie-ups with NBFCs for education loans.', processOwner: 'Leadership Team', phase: 'Phase 1 (6 Months): Design Scholarship Program' },
      { title: 'Digital and Social Media Engagement', description: 'Podcasts, YouTube channels, influencer engagement, celebrate relevant days/events on social media.', processOwner: 'Social Media Team', phase: 'Phase 1 (3 Months): Content Planning' },
    ],
  },
  {
    planId: 'plan-sustainability',
    tableRef: 'Strategic Plan — Table 13: Sustainability Development',
    items: [
      { title: 'SDG 3: Good Health and Well-being', description: 'Open gym, fitness integration, mental health support, faculty health insurance, improved medical facilities.', processOwner: 'IQAC / HRD / Facilities / Sports Committee', phase: 'Phase 1 (6 Months): Plan and Design' },
      { title: 'SDG 4: Quality Education', description: 'L&D Plans, R&D Plans, TLC, student support; scholarships for underprivileged students.', processOwner: 'Director / Academic Department Heads', phase: 'Phase 1 (6 Months): Identify Beneficiaries' },
      { title: 'SDG 5: Gender Equality', description: 'Center for women development, POSH Committee, scholarships to increase girl student enrolment.', processOwner: 'CASH Committee', phase: 'Phase 1 (6 Months)' },
      { title: 'SDG 6: Clean Water and Sanitation', description: 'Rainwater harvesting, water conservation, sanitation upgrades.', processOwner: 'Facilities Department', phase: 'Phase 1 (1 Year): Implementation' },
      { title: 'SDG 7: Affordable and Clean Energy', description: 'Solar power expansion, energy-efficient systems, generator and transformer upgrades.', processOwner: 'Facilities Department', phase: 'Phase 1 (1 Year)' },
      { title: 'SDG 8: Decent Work and Economic Growth', description: 'Industry partnerships, employability programs, entrepreneurship support.', processOwner: 'Leadership / Placements', phase: 'Phase 2 (1 Year)' },
      { title: 'SDG 9: Industry, Innovation and Infrastructure', description: 'Innovation labs, industry MoUs, research commercialization.', processOwner: 'RIC / Leadership', phase: 'Phase 2 (1 Year)' },
      { title: 'SDG 11: Sustainable Cities and Communities', description: 'Green campus initiatives, waste management, community outreach.', processOwner: 'IQAC / Facilities', phase: 'Phase 2 (Ongoing)' },
      { title: 'SDG 12: Responsible Consumption and Production', description: 'E-waste management, sustainable procurement, resource efficiency.', processOwner: 'IQAC / Facilities', phase: 'Phase 1 (Ongoing)' },
      { title: 'SDG 13: Climate Action', description: 'Carbon footprint reduction, tree plantation, environmental awareness.', processOwner: 'Facilities / IQAC', phase: 'Phase 2 (Ongoing)' },
      { title: 'SDG 17: Partnerships for the Goals', description: 'MoUs, Centres of Excellence, community and industry partnerships for SDGs.', processOwner: 'Leadership / R&D', phase: 'Phase 1 (6 Months)' },
    ],
  },
  {
    planId: 'plan-academic',
    tableRef: 'Strategic Plan — Section 2: Academic and Research Excellence',
    items: [
      { title: 'Emerging Domain Programs', description: 'AI/ML, Cybersecurity, Quantum Computing, Data Science, Industry 4.0, Electric Vehicles.', processOwner: 'Academic Council', phase: 'Phase 2' },
      { title: 'Interdisciplinary and Integrated Programs', description: 'Programs aligned to market needs; Hotel Management, Journalism, integrated programs.', processOwner: 'Academic Council', phase: 'Phase 2' },
      { title: 'PhD Programs in Engineering', description: 'PhD programs in all engineering disciplines.', processOwner: 'Academic Council / R&D', phase: 'Phase 2' },
      { title: 'Curriculum Revision for Emerging Domains', description: 'Revise curriculum for emerging technologies, skilling and competency assessments.', processOwner: 'Academic Council', phase: 'Phase 1' },
      { title: 'Industry-Academic Partnerships', description: 'Collaborations for internships, projects, certifications, and placements.', processOwner: 'Academics / Placements', phase: 'Phase 1' },
      { title: 'Centers of Excellence in Frontier Technologies', description: 'Establish CoEs in AI and frontier technologies with industry partners.', processOwner: 'R&D / Academic Council', phase: 'Phase 1' },
    ],
  },
]

export function getImplementationTableItems(planId: string, documentRef: string): PlanItemSeed[] {
  const table = IMPLEMENTATION_PLAN_TABLES.find((t) => t.planId === planId)
  if (!table) return []
  return table.items.map((item) => ({
    ...item,
    documentRef: item.documentRef ?? table.tableRef ?? documentRef,
    status: item.status ?? 'todo',
  }))
}
