import { Injectable, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { QuestionService, ApiQuestion } from './question.service';
import { ContactService } from '../contact/contact.service';

export type PersonaKey = 'brand' | 'tier1' | 'tier2' | 'tier3' | 'chemical';

export interface TechnicalCategory {
  key: string;
  route: string;
  label: string;
  relevance: string;
  forwardLooking: boolean;
  removedFor: string[];
  items: Record<PersonaKey, string[]>;
}

export interface CategoryScoreRow {
  key: string;
  label: string;
  score: 0 | 1 | 2;
  yes: number;
  total: number;
}

export type ScoreRow = CategoryScoreRow;

export interface OptionItem {
  v: string;
  t: string;
  d: string;
  icon?: 'brand' | 'supplier';
}

export const REPUT_URL = 'https://www.reput.ai/#about';
export const DEMO_URL = 'https://www.reput.ai/#contact';

export const ASSURE = {
  intro:
    'We’re here to walk this with you. Answer with what you have today, and we’ll help you close whatever is still open.',
  espr: 'You don’t need to remember any of this. We’ll keep the jargon light and guide you through the rest.',
  contact: 'Tell us where to send your results. We’ll be right here to help you make sense of them.',
  profile: 'Choose the closest fit. Everything that follows will be shaped around you.',
  tierBrand:
    'Most brands only see part of the chain today. Wherever your view stops, we’ll help you take the next step.',
  tierSupplier: 'Pick the closest fit. We’ll shape the questions around what your role can realistically offer.',
  market: 'Not sure yet? That’s fine. Pick what fits today and we’ll guide you from there.',
  results:
    'Every “No” is something we can build together. RePut.ai and BluWin will hand-hold you through the gaps, step by step.',
};

export const PERSONA_OPTIONS: Array<{
  v: 'brand' | 'supplier';
  t: string;
  d: string;
  icon: 'brand' | 'supplier';
}> = [
  {
    v: 'brand',
    t: 'A brand or retailer selling products in EU market',
    d: 'You place finished products on the EU market under your own brand or retail label. We assess readiness at company level, not for one product line.',
    icon: 'brand',
  },
  {
    v: 'supplier',
    t: 'Supply Chain Partner',
    d: 'You supply materials, processing, components or chemicals into a brand’s or another supplier’s chain, at any tier.',
    icon: 'supplier',
  },
];

export const VISIBILITY_OPTIONS: OptionItem[] = [
  { v: 'tier1', t: 'Tier 1 only', d: 'Cut-and-sew, final assembly and finishing' },
  { v: 'tier12', t: 'Tier 1 + Tier 2', d: 'Includes fabric mills, dyeing, printing and finishing' },
  {
    v: 'tier123',
    t: 'Tier 1 + Tier 2 + Tier 3',
    d: 'Includes yarn, fibre and raw-material producers',
  },
  { v: 'unsure', t: 'Not sure', d: 'We don’t yet have a clear view across tiers' },
];

export const TIER_OPTIONS: OptionItem[] = [
  {
    v: 'tier1',
    t: 'Tier 1: Garment Manufacturer',
    d: 'Cut-and-sew, assembly and finishing of the finished garment',
  },
  {
    v: 'tier2',
    t: 'Tier 2: Fabric / Wet Processor',
    d: 'Weaving, knitting, dyeing, printing or finishing of fabric',
  },
  {
    v: 'tier3',
    t: 'Tier 3: Fibre / Yarn / Raw Material Supplier',
    d: 'Spinning, ginning, fibre or raw-material production',
  },
  {
    v: 'chemical',
    t: 'Chemical Manufacturer / Formulator',
    d: 'Dyes, auxiliaries, finishing agents and other chemical formulations',
  },
];

export const MARKET_OPTIONS: string[] = ['EU', 'UK', 'USA', 'China', 'Other', 'Not sure yet'];

export const SHIRT_IMG = '/images (3).jpeg';

export const TECHNICAL_CATEGORIES: TechnicalCategory[] = [
  {
    key: 'identification',
    route: '/identification',
    label: 'Product Identification & Traceability',
    relevance:
      'Gives the product a clear digital identity and links it to suppliers, sites, materials, batches and supporting records.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Does every product have a unique ID (GTIN, SKU or style number)?',
        'Do you record the legal manufacturer and EU economic operator for each product?',
        'Do you know which facilities make each product?',
        'Do you hold a bill of materials for each product?',
        'Can you name the supplier behind each key material?',
        'Is each product’s CN/HS code recorded?',
      ],
      tier1: [
        'Can you link each production batch to the customer’s style and order?',
        'Do you record the legal entity and site for each production location?',
        'Can you link each batch to its site and production date?',
        'Do you hold a bill of materials for each product?',
        'Can you link fabrics and trims to their suppliers and lots?',
      ],
      tier2: [
        'Does each fabric lot have a unique ID and batch number?',
        'Do you record the legal entity and site for each processing location?',
        'Can you trace each fabric lot to its yarn lots and suppliers?',
        'Can you link each lot to the processing stages it went through?',
        'Can you link each lot to the customer order?',
      ],
      tier3: [
        'Does each fibre or yarn lot have a unique ID and batch reference?',
        'Do you record the legal entity and the production or origin site?',
        'Can you trace each lot to its supplier and source material?',
        'Can you identify the country, region, farm or recycling source?',
        'Can you link each lot to the customer order or invoice?',
      ],
      chemical: [
        'Does each formulation have a unique product or trade name?',
        'Do you record the legal manufacturer and manufacturing site?',
        'Can you trace each batch to its formulation, site and production date?',
      ],
    },
  },
  {
    key: 'material_comp',
    route: '/material-comp',
    label: 'Material Composition & Substances of Concern',
    relevance:
      'Shows what the product is made from and identifies substances relevant to compliance, safety and circularity.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Is each product’s fibre composition documented in percentages?',
        'If you claim recycled content, is the percentage and pre/post-consumer split documented?',
        'Can you get restricted-substance data from your suppliers?',
        'Can you say which component holds a substance of concern, and how much?',
      ],
      tier1: [
        'Is the fibre composition of every fabric and trim documented?',
        'If you use recycled material, is its percentage and pre/post-consumer status documented?',
        'Can you get restricted-substance data from your material and chemical suppliers?',
        'Are your on-site chemicals (washing, printing, dyeing) linked to current SDSs?',
      ],
      tier2: [
        'Is fibre composition documented in percentages for each fabric?',
        'If you claim recycled content, is the percentage and pre/post-consumer split documented?',
        'Do you record dyes, pigments and auxiliaries by trade name and supplier?',
        'Is each chemical linked to a current SDS?',
        'Can you back restricted-substance claims with declarations or test reports?',
      ],
      tier3: [
        'Is material composition documented in percentages?',
        'If you supply recycled material, is the percentage and pre/post-consumer origin documented?',
        'Do you document chemical treatments, additives or spin finishes?',
        'Can you provide restricted-substance evidence when asked?',
      ],
      chemical: [
        'Do you hold a current SDS and TDS for every product?',
        'Is each product’s GHS/CLP hazard classification documented?',
        'Is its REACH / SVHC status documented?',
        'Can you disclose substances of concern, within confidentiality limits?',
        'Do your test reports state the product, batch, method, lab and date?',
      ],
    },
  },
  {
    key: 'durability',
    route: '/durability',
    label: 'Durability, Reliability & Repairability',
    relevance:
      'Shows how the product performs over time and whether its useful life can be maintained or extended.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Do you have durability test results (colour fastness, abrasion, pilling, seam strength)?',
        'If you claim a product lifetime, is the basis documented?',
        'Do you provide care and maintenance instructions?',
        'Do you provide repair instructions where relevant?',
      ],
      tier1: ['Do you have test results for seam strength, shrinkage and colour fastness?'],
      tier2: [
        'Do you have test results for colour fastness, shrinkage, pilling, abrasion and strength?',
        'Can you link test results to the fabric lot you supply?',
      ],
      tier3: [
        'Do you have specs and test results for your fibre or yarn?',
        'Can you link test results to the grade or lot you supply?',
      ],
      chemical: [],
    },
  },
  {
    key: 'reusability',
    route: '/reusability',
    label: 'Reuse, Repair & Circular Design',
    relevance: 'Shows whether the product supports repair, reuse, resale, refurbishment or disassembly.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Have you checked whether key components can be separated or repaired?',
        'If you offer repair, resale or take-back, is the process documented?',
        'Can you give repairers and reuse partners the information they need?',
      ],
      tier1: [
        'Can you share construction details for repair or disassembly (seams, fasteners, adhesives)?',
        'Can you identify components that are hard to separate or replace?',
      ],
      tier2: [],
      tier3: [],
      chemical: [],
    },
  },
  {
    key: 'recyclability',
    route: '/recyclability',
    label: 'Recyclability & Recycled Content',
    relevance:
      'Supports recycled-content claims and shows whether materials and construction enable effective recycling.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Have you assessed each product’s recyclability?',
        'Have you identified a feasible recycling route?',
        'Do you know which blends, coatings or trims block recycling?',
      ],
      tier1: [
        'Can you identify trims, coatings, prints or adhesives that affect recycling?',
        'Can you give customers material and construction data for recyclability?',
      ],
      tier2: [
        'Do you document blends, coatings, finishes and treatments that affect recycling?',
        'If you’ve assessed recyclability, are the method and recycling route documented?',
      ],
      tier3: ['Do you hold data on purity, blends and additives that affect recycling?'],
      chemical: [],
    },
  },
  {
    key: 'env_footprint',
    route: '/env-footprint',
    label: 'Broader Environmental Footprint',
    relevance: 'Gives a wider picture of a product’s environmental impact.',
    forwardLooking: true,
    removedFor: [],
    items: {
      brand: [
        'Do you have a product-level LCA, PEF or EPD?',
        'Can you trace the reported impact results back to the study?',
      ],
      tier1: ['Do you have an LCA or EPD for the product or process?'],
      tier2: ['Do you have an LCA or EPD for the fabric or process?'],
      tier3: ['Do you have an LCA or EPD for the material?'],
      chemical: ['Do you have an LCA or EPD for the chemical product?'],
    },
  },
  {
    key: 'resource_use',
    route: '/resource-use',
    label: 'Resource Use',
    relevance:
      'Captures energy and water data that strengthens the evidence behind your product and sustainability claims.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [],
      tier1: [
        'Do you measure energy use at your facility?',
        'Do you measure water use in your processes?',
        'Can you allocate energy and water to specific products or orders?',
      ],
      tier2: [
        'Do you measure energy use in processing?',
        'Do you measure freshwater use in wet processing?',
        'Can you allocate energy and water to a specific fabric or lot?',
      ],
      tier3: ['Can you give energy and water figures, measured or allocated, per material or lot?'],
      chemical: [],
    },
  },
  {
    key: 'waste_eol',
    route: '/waste-eol',
    label: 'Waste & End-of-Life',
    relevance: 'Shows how waste and end-of-life routes such as reuse, recycling or treatment are managed.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Have you defined an end-of-life route for the product (reuse, resale, recycling)?',
        'Do you give guidance on preparing or handing over the product at end-of-life?',
      ],
      tier1: [
        'Do you record production waste by type?',
        'Do you document how each waste type is treated?',
        'If you run wet processing, do you track wastewater volumes, treatment and test results?',
      ],
      tier2: [
        'Do you record process waste by type?',
        'Do you document how each waste stream is treated?',
        'Do you track wastewater volumes, treatment, discharge and test results?',
        'Do you hold air-emission monitoring records or permits where relevant?',
      ],
      tier3: [
        'Do you document production waste, wastewater and emissions?',
        'Do you record how they are treated or discharged?',
      ],
      chemical: [],
    },
  },
  {
    key: 'data_quality',
    route: '/data-quality',
    label: 'Data Quality & Verification',
    relevance:
      'Ensures information is current, traceable and supported by reliable evidence or documented methods.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Can every DPP data point or claim be traced to proof (declaration, test report, invoice)?',
        'Are calculation methods and assumptions documented?',
        'Where you claim independent verification, do you hold the report?',
      ],
      tier1: [
        'Can the data you provide be traced to source records (POs, invoices, test reports)?',
        'Are assumptions and allocation methods documented for estimates?',
        'Where data is independently verified, can you show who verified it and when?',
      ],
      tier2: [
        'Can composition, process and chemical-use data be traced to batch records and invoices?',
        'Are assumptions and allocation methods documented for calculated data?',
        'Where data is independently verified, can you show who verified it and when?',
      ],
      tier3: [
        'Can origin, composition and recycled-content claims be traced to certificates or records?',
        'Are assumptions and methods documented for estimates?',
        'Where data is independently verified, can you show who verified it and when?',
      ],
      chemical: [
        'Can each compliance claim be traced to evidence (formulation data, declarations, reports)?',
        'Are methods and assumptions documented for modelled data?',
        'Where you claim independent verification, can you show the verifier and date?',
      ],
    },
  },
  {
    key: 'certifications',
    route: '/compliance',
    label: 'Certifications & Evidence',
    relevance:
      'Gives product, material and sustainability claims their supporting proof. Certificates back up your data. They don’t replace it.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Are certificates and test reports linked to the product, facility or supplier they cover?',
        'Do you record each certificate’s number, issuer, scope and expiry?',
        'Can you confirm each claimed product falls within its certificate’s scope?',
      ],
      tier1: [
        'Are certificates linked to the facility, product or material they cover?',
        'Do you record each certificate’s number, issuer, scope and expiry?',
        'Can you show the products you supply fall within the certificate scope?',
      ],
      tier2: [
        'Are certificates linked to the material, chemical, process or facility they cover?',
        'Do you record each certificate’s number, issuer, scope and expiry?',
        'Can you show the fabric you supply falls within the certificate scope?',
      ],
      tier3: [
        'Is each certification claim linked to the material, source, facility or transaction?',
        'Do you record each certificate’s number, issuer, scope and expiry?',
        'Do chain-of-custody records show certified or recycled material falls within the certification?',
      ],
      chemical: [
        'Do you record each certificate’s number, issuer, covered products and expiry?',
        'Can you show each product falls within its certificate’s scope?',
        'Do you keep test reports and declarations alongside each certificate?',
      ],
    },
  },
  {
    key: 'data_structure',
    route: '/structure',
    label: 'Data Structure',
    relevance:
      'Shows whether your information is organised digitally, so it can be linked, shared, updated and reused over time.',
    forwardLooking: false,
    removedFor: [],
    items: {
      brand: [
        'Is your product data in one controlled digital system, not scattered emails and spreadsheets?',
        'Can product IDs be digitally linked to suppliers, batches, certificates and test reports?',
        'Can you export data in a structured format (CSV, JSON, API)?',
        'Are owners assigned to enter, review and update data?',
        'Do you keep version history or an audit trail?',
      ],
      tier1: [
        'Can customer style IDs be digitally linked to orders, lots, suppliers and evidence?',
        'Can you share supply-chain data electronically in a structured format?',
        'Are owners assigned to maintain production and supplier data?',
        'Do you keep version history or an audit trail?',
      ],
      tier2: [
        'Can fabric lots be digitally linked to raw materials, chemicals, facilities and orders?',
        'Can you share process data in a structured digital format?',
        'Are owners assigned to maintain the data?',
        'Do you keep version history or an audit trail?',
      ],
      tier3: [
        'Can material lots be digitally linked to origin, facility, certification and customer transaction?',
        'Can you share material data in a structured format?',
        'Are owners assigned to maintain the data?',
        'Do you keep version history or an audit trail?',
      ],
      chemical: [
        'Are product, SDS, TDS, certificate and test data kept in one controlled digital system?',
        'Can each product be digitally linked to its formulation version, batch, SDS and test reports?',
        'Can you share compliance data with customers in a structured format, not just PDFs?',
        'Are owners assigned to maintain and approve this data?',
        'Do you keep version history and a defined update process for formulation or classification changes?',
      ],
    },
  },
];

export const SECTION_GUIDE: Record<string, string> = {
  identification:
    'We’ll begin with the foundations: how each product is identified and traced. You’re not doing this alone.',
  material_comp:
    'Now, what your product is made of and what it contains. Share what you know today.',
  durability:
    'Next, how your product holds up over time. A quick yes or no on each is all we need.',
  reusability:
    'This one is about giving products a second life through repair and reuse. Just tell us where you are.',
  recyclability:
    'Here we look at whether your product can be recycled at the end of its life. Take it at your own pace.',
  env_footprint:
    'This is an advanced readiness area that goes beyond today’s baseline. It gives you a head start on where buyers and regulators are moving, and we’re happy to guide you through it.',
  resource_use:
    'Now, the energy and water behind your production. Whatever you track today is a good place to start.',
  waste_eol:
    'Let’s look at what happens to waste and wastewater. We’ll help you build this picture step by step.',
  data_quality:
    'This is about how well your data can be backed up when someone asks. We can help you strengthen it.',
  certifications:
    'Here we look at the certificates behind your claims. Still collecting them? We can help.',
  data_structure:
    'Last one: how your information is stored and shared. Many teams start with spreadsheets, and we can help you move on from there.',
};

export const HELP_NOTE: Record<string, string> = {
  identification: 'We can help you set up product IDs and link them to your suppliers and production sites.',
  material_comp: 'We can help you gather composition and restricted-substance data directly from your suppliers.',
  durability: 'We can help you line up the right tests and the care and repair information buyers expect.',
  reusability: 'We can help you assess repairability and shape a take-back or reuse route.',
  recyclability: 'We can help you assess recyclability and spot what holds it back.',
  env_footprint: 'We can help you plan an environmental assessment at a pace that suits you.',
  resource_use: 'We can help you set up simple tracking for energy and water.',
  waste_eol: 'We can help you organise your waste and wastewater records.',
  data_quality: 'We can help you connect every claim to the proof behind it.',
  certifications: 'We can help you organise your certificates and check they cover the right products.',
  data_structure: 'We can bring this data together in one place, ready to share when buyers ask.',
};

export const WHERE_TO_FIND: Record<string, string> = {
  identification:
    'ERP / MES, PLM and tech packs, GOTS / GRS transaction certificates, purchase and shipping records.',
  material_comp:
    'BOMs, supplier declarations, SDS / TDS, OEKO-TEX® and ZDHC approvals, lab test reports.',
  durability: 'Accredited lab test reports, customer performance specs, tech packs, QC records.',
  reusability: 'Construction specs and BOMs, repair and care manuals, take-back or resale records.',
  recyclability: 'GRS / RCS certificates, recycled-content declarations, BOMs, recyclability assessments.',
  env_footprint: 'Environmental assessment reports, EPDs, calculation files, Higg FEM.',
  resource_use: 'Energy, steam and water meters, utility bills, Higg FEM, OEKO-TEX® STeP.',
  waste_eol: 'Waste registers and manifests, ETP records, ZDHC ClearStream, emission monitoring reports.',
  data_quality: 'Audit and verification reports, accredited lab reports, version-controlled calculation files.',
  certifications: 'OEKO-TEX®, ZDHC, GOTS / Textile Exchange, Cradle to Cradle and ISO certificates.',
  data_structure:
    'ERP / MES, PLM / PIM, LIMS, traceability platforms like RePut.ai, APIs and CSV / JSON exchange.',
};

export const TIER_LABELS: Record<string, string> = {
  tier1: 'Tier 1: Garment Manufacturer',
  tier2: 'Tier 2: Fabric / Wet Processor',
  tier3: 'Tier 3: Fibre / Yarn / Raw Material Supplier',
  chemical: 'Chemical Manufacturer / Formulator',
};

export const NEXT_LEVEL: Record<
  string,
  { eyebrow: string; title: string; body: string; cta: string }
> = {
  tier1: {
    eyebrow: 'Your next level: Tier 2',
    title: 'Let’s bring your fabric mills into view',
    body: 'Right now your view ends at Tier 1. We’ll invite your Tier 2 fabric and wet-processing suppliers onto RePut.ai and collect their data alongside them, so you reach the next tier without chasing spreadsheets.',
    cta: 'Help me reach Tier 2',
  },
  tier12: {
    eyebrow: 'Your next level: Tier 3',
    title: 'Let’s reach your fibre and yarn suppliers',
    body: 'You can already see to Tier 2. We’ll onboard your Tier 3 fibre and yarn suppliers as well, and link their data to your products so origin and composition claims have proof behind them.',
    cta: 'Help me reach Tier 3',
  },
  tier123: {
    eyebrow: 'Your next level: keep it connected',
    title: 'You see the whole chain. Now make it audit-ready',
    body: 'Visibility to Tier 3 is a strong base. The next step is structuring and verifying that data so it stays linked, current and ready when a buyer or regulator asks. We’ll do that with you.',
    cta: 'Help me structure it',
  },
  unsure: {
    eyebrow: 'Your next level: map your chain',
    title: 'Let’s start by mapping who supplies what',
    body: 'A clear picture of your tiers is where everyone starts. We’ll map your suppliers with you, then invite them in and collect their data step by step.',
    cta: 'Help me map my chain',
  },
};

@Injectable({
  providedIn: 'root',
})
export class AssessmentStateService {
  private assId: number | null = null;
  private scoreData: any = null;

  private qs = inject(QuestionService);
  private contactApi = inject(ContactService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private saveTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private profileTimer: ReturnType<typeof setTimeout> | null = null;
  private lastProfileKey = '';

  constructor() {
    // Runs whenever the user picks something on profile / tier-follow / market
    effect(() => {
      this.profile(); // reading the signals makes the effect re-run when they change
      this.markets();
      this.saveProfileToApi();
    });
  }

  // Saves role, tier_level and export_market_country to assessment_contact.
  // Waits 600 ms so quick clicks (choosing several markets) become ONE request.
  private saveProfileToApi(): void {
    if (!this.isBrowser) return; // never on the server (SSR)
    if (this.profileTimer) clearTimeout(this.profileTimer);

    this.profileTimer = setTimeout(() => {
      const assId = this.getAssId(); // read now: ass_id may arrive a moment late
      if (!assId) return;
      if (!this.profile().persona) return; // nothing chosen yet

      const { role, tier_level } = this.dbProfile();
      const export_market_country = this.markets().join(', ');

      // Skip if nothing changed since the last save
      const key = `${assId}|${role}|${tier_level}|${export_market_country}`;
      if (key === this.lastProfileKey) return;
      this.lastProfileKey = key;

      this.contactApi
        .saveProfile({ ass_id: assId, role, tier_level, export_market_country })
        .subscribe({
          error: (e: unknown) => {
            this.lastProfileKey = ''; // allow a retry on the next change
            console.error('Save profile failed', e);
          },
        });
    }, 600);
  }

  // Converts your screen choices into the words stored in the database
  private dbProfile(): { role: string; tier_level: string } {
    const p = this.profile();
    if (p.persona === 'supplier') {
      return { role: 'Supplier', tier_level: p.tier ? TIER_LABELS[p.tier] : '' };
    }
    const brandTier: Record<string, string> = {
      tier1: 'Tier 1 only',
      tier12: 'Tier 1 + Tier 2',
      tier123: 'Tier 1 + 2 + 3',
      unsure: 'Not sure',
    };
    return { role: 'Brand', tier_level: p.visibility ? brandTier[p.visibility] : '' };
  }

  // The API questions for one screen (section), in the right order
  private apiRowsFor(catKey: string): ApiQuestion[] {
    const cat = TECHNICAL_CATEGORIES.find((c) => c.key === catKey);
    if (!cat) return [];
    const { role, tier_level } = this.dbProfile();
    const norm = (s: string) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
    return this.qs
      .rows()
      .filter(
        (r) => r.role === role && r.tier_level === tier_level && norm(r.section_name) === norm(cat.label)
      )
      .sort((a, b) => a.que_id - b.que_id);
  }

  // Saves one answer to the database
  private saveAnswerToApi(catKey: string, index: number, value: boolean): void {
    const assId = this.getAssId();
    if (!assId) {
      console.warn('No ass_id yet, answer not saved');
      return;
    }
    const row = this.apiRowsFor(catKey)[index];
    if (!row) {
      console.warn('No que_id found for', catKey, index);
      return;
    }
    const prev = this.saveTimers.get(row.que_id);
    if (prev) clearTimeout(prev);
    this.saveTimers.set(
      row.que_id,
      setTimeout(() => {
        this.saveTimers.delete(row.que_id);
        this.qs.save({
          ass_id: assId,
          role: row.role,
          tier_level: row.tier_level,
          que_id: row.que_id,
          ans: value ? 'Yes' : 'No',
        });
      }, 400)
    );
  }

  readonly contact = signal<{ name: string; company: string; email: string }>({
    name: '',
    company: '',
    email: '',
  });

  readonly profile = signal<{
    persona: '' | 'brand' | 'supplier';
    tier: '' | 'tier1' | 'tier2' | 'tier3' | 'chemical';
    visibility: '' | 'tier1' | 'tier12' | 'tier123' | 'unsure';
  }>({
    persona: '',
    tier: '',
    visibility: '',
  });

  readonly markets = signal<string[]>([]);

  readonly categoryData = signal<Record<string, { answers: (boolean | null)[] }>>(
    this.createEmptyCategoryData()
  );

  readonly demoBooked = signal<boolean>(false);

  readonly referrals = signal<
    Array<{ supplierName: string; supplierEmail: string; tier: string }>
  >([]);

  private createEmptyCategoryData(): Record<string, { answers: (boolean | null)[] }> {
    const map: Record<string, { answers: (boolean | null)[] }> = {};
    for (const c of TECHNICAL_CATEGORIES) {
      map[c.key] = { answers: [] };
    }
    return map;
  }

  setAssId(id: number): void {
    this.assId = id;
    this.saveProfileToApi();
  }

  getAssId(): number | null {
    return this.assId;
  }

  setScoreData(data: any): void {
    this.scoreData = data;
  }

  getScoreData(): any {
    return this.scoreData;
  }

  setContact(contact: { name: string; company: string; email: string }): void {
    this.contact.set({ ...contact });
  }

  setPersona(persona: 'brand' | 'supplier'): void {
    const current = this.profile();
    if (current.persona !== persona) {
      this.profile.set({ persona, tier: '', visibility: '' });
      this.markets.set([]);
      this.resetCategoryData();
    }
  }

  setVisibility(visibility: 'tier1' | 'tier12' | 'tier123' | 'unsure'): void {
    this.profile.update((p) => ({ ...p, visibility }));
  }

  setTier(tier: 'tier1' | 'tier2' | 'tier3' | 'chemical'): void {
    const current = this.profile();
    if (current.tier !== tier) {
      this.profile.update((p) => ({ ...p, tier }));
      this.resetCategoryData();
    }
  }

  toggleMarket(market: string): void {
    const sel = this.markets();
    if (market === 'Not sure yet') {
      this.markets.set(sel.includes(market) ? [] : [market]);
    } else {
      const withoutUnsure = sel.filter((x) => x !== 'Not sure yet');
      this.markets.set(
        withoutUnsure.includes(market)
          ? withoutUnsure.filter((x) => x !== market)
          : [...withoutUnsure, market]
      );
    }
  }

  resetCategoryData(): void {
    this.categoryData.set(this.createEmptyCategoryData());
  }

  /** Returns the active persona key; defaults to 'brand' if visited directly so static preview works. */
  personaKey(): PersonaKey {
    const p = this.profile();
    if (p.persona === 'brand') return 'brand';
    if (p.persona === 'supplier' && p.tier) return p.tier;
    return 'brand';
  }

  activeCategories(): TechnicalCategory[] {
    const pk = this.personaKey();
    return TECHNICAL_CATEGORIES.filter(
      (c) => !c.removedFor.includes(pk) && (c.items[pk] || []).length > 0
    );
  }

  getCategoryItems(catKey: string): string[] {
    const apiRows = this.apiRowsFor(catKey);
    if (apiRows.length) return apiRows.map((r) => r.question); // from the database

    // fallback: the old hardcoded text
    const cat = TECHNICAL_CATEGORIES.find((c) => c.key === catKey);
    const pk = this.personaKey();
    return cat ? cat.items[pk] || [] : [];
  }

  ensureCategoryAnswers(catKey: string): void {
    const items = this.getCategoryItems(catKey);
    const current = this.categoryData()[catKey]?.answers || [];
    if (!Array.isArray(current) || current.length !== items.length) {
      const initialized = new Array<boolean | null>(items.length).fill(null);
      this.categoryData.update((d) => ({
        ...d,
        [catKey]: { answers: initialized },
      }));
    }
  }

  getCategoryAnswers(catKey: string): (boolean | null)[] {
    this.ensureCategoryAnswers(catKey);
    return this.categoryData()[catKey]?.answers || [];
  }

  setCategoryAnswer(catKey: string, index: number, value: boolean): void {
    const items = this.getCategoryItems(catKey);
    const existing = this.categoryData()[catKey]?.answers || [];
    const answers =
      Array.isArray(existing) && existing.length === items.length
        ? [...existing]
        : new Array<boolean | null>(items.length).fill(null);
    answers[index] = value;
    this.categoryData.update((d) => ({
      ...d,
      [catKey]: { answers },
    }));
    this.saveAnswerToApi(catKey, index, value);
  }

  setAnswer(catKey: string, index: number, value: boolean): void {
    this.setCategoryAnswer(catKey, index, value);
  }

  /** Full ordered list of step keys that appear in .rail / STEP X / N */
  questionFlow(): string[] {
    const flow: string[] = ['tierfollow', 'market'];
    for (const c of this.activeCategories()) {
      flow.push('cat:' + c.key);
    }
    return flow;
  }

  getStepMeta(stepId: string): {
    idx: number;
    total: number;
    stepNumber: number;
    totalSteps: number;
    tag: string;
    segments: Array<'done' | 'active' | ''>;
  } {
    const qf = this.questionFlow();
    const idx = Math.max(0, qf.indexOf(stepId));
    let tag = '';
    if (stepId === 'tierfollow') tag = 'Your role';
    else if (stepId === 'market') tag = 'Your markets';
    else if (stepId.startsWith('cat:')) {
      const cat = TECHNICAL_CATEGORIES.find((c) => c.key === stepId.slice(4));
      tag = cat ? cat.label : '';
    }
    const segments = qf.map((_, i) => (i < idx ? 'done' : i === idx ? 'active' : ''));
    return {
      idx,
      total: qf.length,
      stepNumber: idx + 1,
      totalSteps: qf.length,
      tag,
      segments: segments as Array<'done' | 'active' | ''>,
    };
  }

  private stepIdToRoute(stepId: string): string {
    if (stepId === 'intro') return '/start-assessment';
    if (stepId === 'espr') return '/espr-dpp';
    if (stepId === 'contact') return '/contact';
    if (stepId === 'profile') return '/profile';
    if (stepId === 'tierfollow') return '/tier-follow';
    if (stepId === 'market') return '/market';
    if (stepId === 'positioning') return '/positioning';
    if (stepId === 'results') return '/score';
    if (stepId.startsWith('cat:')) {
      const cat = TECHNICAL_CATEGORIES.find((c) => c.key === stepId.slice(4));
      if (cat) return cat.route;
    }
    return '/start-assessment';
  }

  buildFullFlow(): string[] {
    const flow = ['intro', 'espr', 'contact', 'profile', 'tierfollow', 'market'];
    for (const c of this.activeCategories()) {
      flow.push('cat:' + c.key);
    }
    flow.push('positioning', 'results');
    return flow;
  }

  getNextRoute(currentStepId: string): string {
    const flow = this.buildFullFlow();
    const idx = flow.indexOf(currentStepId);
    if (idx >= 0 && idx < flow.length - 1) {
      return this.stepIdToRoute(flow[idx + 1]);
    }
    return '/score';
  }

  getBackRoute(currentStepId: string): string {
    const flow = this.buildFullFlow();
    const idx = flow.indexOf(currentStepId);
    if (idx > 0) {
      return this.stepIdToRoute(flow[idx - 1]);
    }
    return '/start-assessment';
  }

  computeScores(): {
    rows: CategoryScoreRow[];
    total: number;
    max: number;
    yes: number;
    qs: number;
  } {
    const pk = this.personaKey();
    const data = this.categoryData();
    const rows: CategoryScoreRow[] = this.activeCategories().map((c) => {
      const items = c.items[pk] || [];
      const a = data[c.key]?.answers || [];
      const yes = a.filter((v) => v === true).length;
      const score: 0 | 1 | 2 = yes === items.length ? 2 : yes === 0 ? 0 : 1;
      return { key: c.key, label: c.label, score, yes, total: items.length };
    });
    const total = rows.reduce((s, r) => s + r.score, 0);
    const max = rows.length * 2;
    const yes = rows.reduce((s, r) => s + r.yes, 0);
    const qs = rows.reduce((s, r) => s + r.total, 0);
    return { rows, total, max, yes, qs };
  }

  bandFor(
    total: number,
    max: number
  ): { label: string; color: string; sub: string } {
    const pct = max ? total / max : 0;
    if (pct >= 0.7) {
      return {
        label: '',
        color: 'var(--teal-solid)',
        sub: 'You already hold a strong foundation of structured data. The next stretch is standardising formats and closing the last few gaps, and we can help you get there.',
      };
    }
    if (pct >= 0.4) {
      return {
        label: '',
        color: 'var(--teal-solid)',
        sub: 'You already hold real, structured data in several areas. We can help you close the remaining gaps and move toward full readiness.',
      };
    }
    return {
      label: '',
      color: 'var(--teal-solid)',
      sub: 'You’re starting from a real foundation. Let’s build a clear roadmap together so the next steps feel manageable.',
    };
  }

  levelY(pct: number): number {
    return 535 - (Math.max(0, Math.min(100, pct)) / 100) * 565;
  }

  shirtCaption(p: {
    yes: number;
    qs: number;
    pct: number;
    final?: boolean;
    band?: string;
    caption?: string;
  }): string {
    if (p.final) return `Your DPP readiness: ${Math.round(p.pct)}%. This is where we start from, together.`;
    if (p.qs === 0 || p.yes === 0) return '';
    if (p.pct < 35) return 'The first colours are showing. Keep going.';
    if (p.pct < 70) return 'Your readiness is building. The colour is coming in.';
    if (p.pct < 100) return 'Almost full colour. Just a few steps left.';
    return 'Full colour. Every answer was a Yes.';
  }

  shirtProgress(isFinal = false): {
    yes: number;
    qs: number;
    pct: number;
    final: boolean;
    band?: string;
    caption: string;
  } {
    if (isFinal) {
      const sc = this.computeScores();
      const pct = sc.max ? (sc.total / sc.max) * 100 : 0;
      return {
        yes: sc.yes,
        qs: sc.qs,
        pct,
        final: true,
        band: '',
        caption: `Your DPP readiness: ${Math.round(pct)}%. This is where we start from, together.`,
      };
    }
    const pk = this.personaKey();
    const data = this.categoryData();
    let yes = 0;
    let qs = 0;
    for (const c of this.activeCategories()) {
      const items = c.items[pk] || [];
      qs += items.length;
      const a = data[c.key]?.answers || [];
      yes += a.filter((v) => v === true).length;
    }
    const pct = qs ? (yes / qs) * 100 : 0;
    const caption = this.shirtCaption({ yes, qs, pct, final: false });
    return { yes, qs, pct, final: false, caption };
  }

  bookDemo(): void {
    this.demoBooked.set(true);
  }

  addReferral(ref: { supplierName: string; supplierEmail: string; tier: string }): void {
    this.referrals.update((r) => [...r, ref]);
  }

  restart(): void {
    this.profile.set({ persona: '', tier: '', visibility: '' });
    this.assId = null;
    this.markets.set([]);
    this.contact.set({ name: '', company: '', email: '' });
    this.demoBooked.set(false);
    this.referrals.set([]);
    this.resetCategoryData();
  }
}