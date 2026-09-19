import { Product, Order, DownloadToken, Customer, EmailRecord, AnalyticsEvent } from '../types.js';

class InMemoryStore {
  products: Map<string, Product> = new Map();
  orders: Map<string, Order> = new Map();
  downloads: Map<string, DownloadToken> = new Map();
  customers: Map<string, Customer> = new Map();
  emails: EmailRecord[] = [];
  analytics: AnalyticsEvent[] = [];
  processedPaymentRefs: Set<string> = new Set();

  constructor() {
    this.seedProducts();
  }

  private seedProducts() {
    const now = new Date().toISOString();

    const eggGuide: Product = {
      id: 'EGG-001',
      name: 'The Complete Egg Health Guide',
      slug: 'complete-egg-health-guide',
      subtitle: 'What Happens Inside Your Body When You Eat Eggs',
      description: 'A visual, evidence-based guide to egg nutrition, digestion kinetics, dietary cholesterol versus serum lipids, choline metabolism, and whole-egg culinary biochemistry.',
      short_description: 'A visual guide to egg nutrition, digestion, cholesterol and safety.',
      price: 9.99,
      currency: 'USD',
      type: 'SINGLE',
      status: 'PUBLISHED',
      cover_image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      file_reference: 'private/storage/pdf/EGG-001-complete-egg-health-guide.pdf',
      page_count: 52,
      benefits: [
        'Demystify dietary cholesterol vs. hepatic LDL receptor synthesis with clear visual diagrams.',
        'Understand the bioavailability of micronutrients: Choline, Lutein, Zeaxanthin, and Vitamin D3.',
        'Compare cooking techniques: Poached, boiled, fried, and baked effects on lipid oxidation.',
        'Learn the science of protein bio-utilization and digestion timelines through the duodenum.'
      ],
      whats_included: [
        '52-page full-color high-resolution Digital PDF publication',
        'Visual Duodenal Digestion Timeline Infographic',
        'Dietary vs Serum Cholesterol Pathway Breakdown',
        'Cooking Temperature & Nutrient Retention Chart',
        'Summary Quick-Reference Cheat Sheet (Printable A4/Letter)'
      ],
      table_of_contents: [
        'Chapter 1: The Anatomy of an Egg – Albumen vs Yolk',
        'Chapter 2: Digestion Mechanics – From Gastric Pepsin to Small Intestinal Absorption',
        'Chapter 3: The Cholesterol Myth – Hepatic Synthesis, ApoB, and HDL Particle Dynamics',
        'Chapter 4: Choline & Phospholipids – Brain Health, Methylation, and Cell Membrane Integrity',
        'Chapter 5: Heat, Cooking Methods, and Lipid Peroxidation Profiles',
        'Chapter 6: Practical Kitchen Guidelines & Evidence-Based FAQ'
      ],
      preview_pages: [
        {
          pageNumber: 8,
          title: 'The Hepatic Cholesterol Feedback Loop',
          subtitle: 'Why 80% of circulating cholesterol is synthesized internally',
          excerpt: 'When dietary cholesterol intake increases, healthy hepatocytes downregulate HMG-CoA reductase and maintain steady-state serum levels in over 70% of healthy hyporesponders.',
          highlightPoints: ['SREBP-2 transcription suppression', 'Enterocyte Niemann-Pick C1-Like 1 (NPC1L1) transporter action', 'Hyper-responder genetic phenotypes']
        },
        {
          pageNumber: 16,
          title: 'Digestion Kinetics in the Gastric Phase',
          subtitle: 'Enzymatic hydrolysis of ovalbumin and ovotransferrin',
          excerpt: 'Hydrochloric acid unravels tertiary peptide structures, exposing cleavage sites for pepsin. Within 90 minutes, over 94% of whole cooked egg protein transitions into absorbable di- and tripeptides.',
          highlightPoints: ['Raw vs cooked avidin-biotin affinity', 'Protein Digestibility-Corrected Amino Acid Score (PDCAAS = 1.0)', 'Gastric emptying rates']
        },
        {
          pageNumber: 31,
          title: 'Carotenoid Bioavailability & Fat-Soluble Matrices',
          subtitle: 'Lutein, Zeaxanthin, and Retinal Pigment Protection',
          excerpt: 'Unlike crystalline synthetic supplements, yolk lutein is naturally dispersed within polar phospholipid micelles, yielding up to 3x higher ocular tissue deposition.',
          highlightPoints: ['Phospholipid micellar packaging', 'Macular pigment optical density (MPOD)', 'Synergistic lipid absorption']
        }
      ],
      faq: [
        {
          question: 'How many eggs can I safely eat per day according to research?',
          answer: 'Current meta-analyses in healthy adults demonstrate that 1 to 3 whole eggs daily does not adversely alter the LDL/HDL ratio or increase cardiovascular biomarker risks for the vast majority of individuals.'
        },
        {
          question: 'Is it better to eat just egg whites or the whole egg?',
          answer: 'The yolk contains virtually all fat-soluble vitamins (A, D, E, K), essential fatty acids, carotenoids, and 90% of the calcium and iron. Eating the whole egg provides balanced protein-to-lipid synergy.'
        },
        {
          question: 'In what format is the guide delivered?',
          answer: 'You will receive an instant, secure digital download token for an interactive, full-color PDF file compatible with smartphones, tablets, e-readers, and desktop computers.'
        }
      ],
      created_at: now,
      updated_at: now
    };

    const sugarGuide: Product = {
      id: 'SUG-001',
      name: 'Sugar & Your Body',
      slug: 'sugar-and-your-body',
      subtitle: 'Biochemical Cascades of Glucose, Fructose, and Insulin',
      description: 'A visual, evidence-based deep dive into carbohydrate metabolism, insulin signaling cascades, hepatic fructose clearance, glycogen storage, and the neurobiology of sweet cravings.',
      short_description: 'An evidence-based visual guide to sugar metabolism and metabolic health.',
      price: 9.99,
      currency: 'USD',
      type: 'SINGLE',
      status: 'PUBLISHED',
      cover_image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=800&q=80',
      file_reference: 'private/storage/pdf/SUG-001-sugar-and-your-body.pdf',
      page_count: 58,
      benefits: [
        'Visualize how glucose vs. fructose follow completely distinct biochemical metabolic paths.',
        'Understand insulin spikes, GLUT4 receptor translocation, and cellular energy uptake.',
        'Explore non-alcoholic fatty liver pathways (De Novo Lipogenesis) and uric acid generation.',
        'Learn practical food pairing strategies to flatten postprandial glucose curves naturally.'
      ],
      whats_included: [
        '58-page full-color high-resolution Digital PDF publication',
        'Glucose vs Fructose Hepatic Fate Comparison Infographic',
        'Continuous Glucose Response & Food Matrix Matrix',
        'Ingredient Label Sugar Alias Decoder (60+ hidden names)',
        'Glycemic Load Quick Pocket Reference Sheet'
      ],
      table_of_contents: [
        'Chapter 1: The Molecular Taxonomy of Sugars – Monosaccharides to Polysaccharides',
        'Chapter 2: Digestion in the Brush Border – SGLT1, GLUT5, and Bloodstream Absorption',
        'Chapter 3: The Pancreas & Insulin Dynamics – Biphasic Secretion and Resistance',
        'Chapter 4: The Fructose Crossroads – Hepatic Fructokinase and De Novo Lipogenesis',
        'Chapter 5: Brain Dopaminergic Pathways – Why Sugar Cravings Feel Irresistible',
        'Chapter 6: Practical Glucose Buffering – Fiber, Vinegar, Protein Preloads, and Movement'
      ],
      preview_pages: [
        {
          pageNumber: 12,
          title: 'The Dual Fate: Glucose vs Fructose',
          subtitle: 'Why the liver treats two equal calories in entirely different ways',
          excerpt: 'While glucose can be oxidized by virtually every cell in the body, 85% of ingested fructose is trapped directly by hepatic fructokinase, bypassing the phosphofructokinase rate-limiting step.',
          highlightPoints: ['Direct hepatic influx', 'AMP deaminase activation and uric acid byproduct', 'Rapid mitochondrial acetyl-CoA saturation']
        },
        {
          pageNumber: 24,
          title: 'GLUT4 Translocation and Post-Meal Movement',
          subtitle: 'How 10 minutes of light walking clears glucose without excess insulin',
          excerpt: 'Muscle contraction activates 5\' AMP-activated protein kinase (AMPK), stimulating GLUT4 vesicle fusion to the plasma membrane independently of pancreatic insulin signaling.',
          highlightPoints: ['Insulin-independent glucose uptake', 'Lowered vascular oxidative stress', 'Mitigation of late-afternoon reactive hypoglycemia']
        },
        {
          pageNumber: 42,
          title: 'The Fiber Matrix Effect',
          subtitle: 'Whole fruit versus fruit juice: why cell wall integrity matters',
          excerpt: 'Intact plant cellulose and pectin create a viscous gel mesh in the duodenum, delaying carbohydrate contact with brush-border disaccharidases and blunting the peak glycemic excursion.',
          highlightPoints: ['Delayed gastric transit', 'L-cell GLP-1 stimulation', 'Blunted insulin C-peptide response']
        }
      ],
      faq: [
        {
          question: 'Are natural sugars like honey and maple syrup healthier than white sugar?',
          answer: 'Chemically, honey and maple syrup contain trace minerals and antioxidants, but their monosaccharide composition (glucose + fructose) produces nearly identical metabolic effects in the liver and bloodstream.'
        },
        {
          question: 'Do I need to eliminate fruit to avoid sugar overload?',
          answer: 'No. Whole fruits contain fiber, polyphenols, water, and micronutrients that slow digestive transit and nourish the gut microbiome, unlike refined or liquid sugars.'
        },
        {
          question: 'Can I view this guide on my iPad or smartphone?',
          answer: 'Yes! The digital PDF is fully formatted for high-definition viewing on smartphones, iPads, e-readers, and laptops, with interactive table-of-contents navigation.'
        }
      ],
      created_at: now,
      updated_at: now
    };

    const fiberGuide: Product = {
      id: 'FIB-001',
      name: 'The Complete Fiber Guide',
      slug: 'complete-fiber-guide',
      subtitle: 'The Science of Gut Microbiome Fermentation and SCFA Production',
      description: 'A visual, evidence-based guide to soluble, insoluble, and prebiotic fibers, short-chain fatty acid (butyrate, acetate, propionate) synthesis, intestinal barrier tight junctions, and microbiome diversity.',
      short_description: 'A visual guide to gut microbiome, fiber types, and digestion.',
      price: 9.99,
      currency: 'USD',
      type: 'SINGLE',
      status: 'PUBLISHED',
      cover_image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      file_reference: 'private/storage/pdf/FIB-001-complete-fiber-guide.pdf',
      page_count: 56,
      benefits: [
        'Understand the 3 core types of fiber: Soluble viscous, Insoluble bulking, and Resistant Starches.',
        'Explore how gut microbes ferment fiber into Butyrate, Acetate, and Propionate.',
        'Learn how short-chain fatty acids reinforce colonocyte tight junction proteins (Claudins & Occludin).',
        'Follow a structured, discomfort-free protocol to ramp up daily fiber from 15g to 40g+.'
      ],
      whats_included: [
        '56-page full-color high-resolution Digital PDF publication',
        'Microbiome Fermentation & SCFA Synthesis Pathway Infographic',
        'High-Fiber Whole Food Density & Soluble/Insoluble Ratio Chart',
        '4-Week Gentle Fiber Adaptation Protocol',
        'Gut-Brain Axis Signaling Infographic'
      ],
      table_of_contents: [
        'Chapter 1: Fiber Beyond Roughage – The Forgotten Essential Nutrient',
        'Chapter 2: Structural Diversity – Beta-Glucans, Pectins, Inulin, and Lignin',
        'Chapter 3: The Colonic Fermentation Factory – Microbial Taxa & Enzymatic Machinery',
        'Chapter 4: The Power of SCFAs – Butyrate for Colonocytes, Acetate for Peripheral Tissues',
        'Chapter 5: The Mucus Layer & Intestinal Barrier Integrity',
        'Chapter 6: Practical 4-Week Stepwise Protocol to Avoid Bloating and Gas'
      ],
      preview_pages: [
        {
          pageNumber: 14,
          title: 'The Short-Chain Fatty Acid Triad',
          subtitle: 'Butyrate, Acetate, and Propionate: Chemical messengers of health',
          excerpt: 'Colonocytes utilize butyrate as their primary energy fuel (providing 70% of their ATP), stimulating hypoxia-inducible factor (HIF) to preserve tight junction barrier integrity.',
          highlightPoints: ['Anti-inflammatory histone deacetylase (HDAC) inhibition', 'T-regulatory cell induction in mucosal lamina propria', 'Appetite regulation via GPR41/43 receptors']
        },
        {
          pageNumber: 26,
          title: 'Resistant Starch: The Retrograded Secret',
          subtitle: 'How cooking and cooling potatoes, rice, and oats alters starch crystallinity',
          excerpt: 'Amylose retrogrades into crystalline type-3 resistant starch (RS3) when cooled, resisting upper gastrointestinal amylase breakdown and delivering pure substrate directly to colonic Bacteroidetes.',
          highlightPoints: ['RS1 to RS4 chemical classifications', 'Up to 50% increase in prebiotic yield', 'Blunted postprandial glucose curves']
        },
        {
          pageNumber: 38,
          title: 'The Fiber Titration Ladder',
          subtitle: 'Overcoming gas and discomfort with gradual microbial adaptation',
          excerpt: 'Sudden increases in fermentable oligosaccharides overwhelm unadapted microbial populations. Gradually increasing daily intake by 3-5 grams per week gives bacterial guilds time to expand.',
          highlightPoints: ['Hydration requirements with viscous fibers', 'Divided meal dosing strategies', 'Low-FODMAP soluble alternatives for sensitive guts']
        }
      ],
      faq: [
        {
          question: 'Why does increasing fiber sometimes cause gas and bloating?',
          answer: 'Rapid influx of fermentable carbohydrates into an unprimed microbiome causes sudden gas production before specialized microbial species expand to balance gas consumption. Our 4-week titration ladder solves this.'
        },
        {
          question: 'Are fiber supplements like psyllium as effective as whole food fiber?',
          answer: 'Psyllium is an outstanding soluble gel-forming fiber for regularity and cholesterol clearance, but lacks the diverse polyphenols, resistant starches, and micronutrients found in diverse whole plants.'
        },
        {
          question: 'Will I be able to download this immediately after checkout?',
          answer: 'Yes! Your download token is generated instantly upon payment verification, and access links are also sent directly to your email.'
        }
      ],
      created_at: now,
      updated_at: now
    };

    const starterBundle: Product = {
      id: 'BND-001',
      name: 'Food & Body Starter Bundle',
      slug: 'food-and-body-starter-bundle',
      subtitle: 'The Complete 3-in-1 Digital Nutrition & Digestion Collection',
      description: 'Get all three comprehensive guides in one package: The Complete Egg Health Guide, Sugar & Your Body, and The Complete Fiber Guide. Over 160 pages of visual, evidence-based nutrition science.',
      short_description: 'Includes all 3 essential guides: Eggs, Sugar, and Fiber. Save over 15%.',
      price: 24.99,
      currency: 'USD',
      type: 'BUNDLE',
      status: 'PUBLISHED',
      cover_image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
      file_reference: 'bundle:EGG-001+SUG-001+FIB-001',
      page_count: 166,
      bundle_product_ids: ['EGG-001', 'SUG-001', 'FIB-001'],
      benefits: [
        'Complete 360-degree foundational understanding of protein, carbohydrate, and prebiotic digestion.',
        'Save over 15% compared to purchasing each individual guide separately ($24.99 vs $29.97).',
        '166+ beautifully illustrated full-color pages with over 120+ peer-reviewed scientific citations.',
        'Instant digital access to all 3 individual PDFs directly after checkout.'
      ],
      whats_included: [
        'The Complete Egg Health Guide (52 Pages, PDF)',
        'Sugar & Your Body (58 Pages, PDF)',
        'The Complete Fiber Guide (56 Pages, PDF)',
        'All 3 Summary Quick-Reference Printable Cheat Sheets',
        'Free future updates to all 3 first-edition publications'
      ],
      table_of_contents: [
        'Part 1: The Complete Egg Health Guide (EGG-001)',
        'Part 2: Sugar & Your Body (SUG-001)',
        'Part 3: The Complete Fiber Guide (FIB-001)',
        'Bonus Appendix: Synergistic Food Pairing Matrix'
      ],
      preview_pages: [
        ...eggGuide.preview_pages.slice(0, 1),
        ...sugarGuide.preview_pages.slice(0, 1),
        ...fiberGuide.preview_pages.slice(0, 1)
      ],
      faq: [
        {
          question: 'How do I access the files when I buy the bundle?',
          answer: 'Your bundle purchase creates an entitlement for all three separate guides. You receive unique, secure download tokens for all three PDFs immediately on the confirmation screen and in your delivery email.'
        },
        {
          question: 'Are the bundle PDFs separate or merged together?',
          answer: 'You receive 3 separate high-resolution PDFs so you can easily store, read, and reference each topic independently.'
        },
        {
          question: 'Do you offer a refund policy?',
          answer: 'Yes! We stand behind our work with a 30-day digital satisfaction guarantee. If you are not satisfied, contact our support team.'
        }
      ],
      created_at: now,
      updated_at: now
    };

    this.products.set(eggGuide.id, eggGuide);
    this.products.set(sugarGuide.id, sugarGuide);
    this.products.set(fiberGuide.id, fiberGuide);
    this.products.set(starterBundle.id, starterBundle);
  }

  // --- Products ---
  getAllProducts(includeUnpublished = false): Product[] {
    const list = Array.from(this.products.values());
    if (includeUnpublished) return list;
    return list.filter(p => p.status === 'PUBLISHED');
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  saveProduct(product: Product): Product {
    product.updated_at = new Date().toISOString();
    this.products.set(product.id, product);
    return product;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // --- Orders ---
  createOrder(order: Order): Order {
    this.orders.set(order.id, order);
    this.updateCustomerRecord(order);
    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return Array.from(this.orders.values()).find(o => o.order_number === orderNumber);
  }

  getOrderByPaymentRef(paymentRef: string): Order | undefined {
    return Array.from(this.orders.values()).find(o => o.payment_reference === paymentRef);
  }

  getOrdersByCustomerEmail(email: string): Order[] {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.orders.values()).filter(o => o.customer_email.trim().toLowerCase() === normalized);
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  updateOrderStatus(orderId: string, status: Order['payment_status']): Order | undefined {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    order.payment_status = status;
    order.updated_at = new Date().toISOString();
    this.orders.set(orderId, order);

    // If order is refunded or cancelled, revoke its active download tokens
    if (status === 'REFUNDED' || status === 'CANCELLED') {
      for (const token of this.downloads.values()) {
        if (token.order_id === orderId) {
          token.is_revoked = true;
        }
      }
    }
    return order;
  }

  // --- Customers ---
  private updateCustomerRecord(order: Order) {
    const email = order.customer_email.trim().toLowerCase();
    const existing = Array.from(this.customers.values()).find(c => c.email.toLowerCase() === email);
    const now = new Date().toISOString();

    if (existing) {
      if (order.payment_status === 'PAID') {
        existing.purchases_count += 1;
        existing.total_spent = Number((existing.total_spent + order.total_amount).toFixed(2));
        existing.last_order_at = now;
      }
    } else {
      const customer: Customer = {
        id: 'CUST-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        name: order.customer_name || email.split('@')[0],
        email: email,
        purchases_count: order.payment_status === 'PAID' ? 1 : 0,
        total_spent: order.payment_status === 'PAID' ? order.total_amount : 0,
        created_at: now,
        last_order_at: now
      };
      this.customers.set(customer.id, customer);
    }
  }

  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values()).sort((a, b) => b.total_spent - a.total_spent);
  }

  // --- Downloads ---
  createDownloadToken(tokenData: Omit<DownloadToken, 'id' | 'created_at' | 'download_count' | 'is_revoked'>): DownloadToken {
    const token: DownloadToken = {
      id: 'DL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      ...tokenData,
      download_count: 0,
      is_revoked: false,
      created_at: new Date().toISOString()
    };
    this.downloads.set(token.token, token);
    return token;
  }

  getDownloadByToken(tokenStr: string): DownloadToken | undefined {
    return this.downloads.get(tokenStr);
  }

  getDownloadsForOrder(orderId: string): DownloadToken[] {
    return Array.from(this.downloads.values()).filter(d => d.order_id === orderId);
  }

  getAllDownloads(): DownloadToken[] {
    return Array.from(this.downloads.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  incrementDownloadCount(tokenStr: string): DownloadToken | undefined {
    const token = this.downloads.get(tokenStr);
    if (!token) return undefined;
    token.download_count += 1;
    return token;
  }

  revokeDownloadToken(tokenStr: string): boolean {
    const token = this.downloads.get(tokenStr);
    if (!token) return false;
    token.is_revoked = true;
    return true;
  }

  // --- Emails ---
  logEmail(email: Omit<EmailRecord, 'id' | 'sent_at'>): EmailRecord {
    const record: EmailRecord = {
      id: 'EML-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      ...email,
      sent_at: new Date().toISOString()
    };
    this.emails.unshift(record);
    return record;
  }

  getAllEmails(): EmailRecord[] {
    return this.emails;
  }

  // --- Analytics ---
  logAnalytics(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): AnalyticsEvent {
    const record: AnalyticsEvent = {
      id: 'EVT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      ...event,
      timestamp: new Date().toISOString()
    };
    this.analytics.unshift(record);
    // Keep last 500 events
    if (this.analytics.length > 500) {
      this.analytics.pop();
    }
    return record;
  }

  getAllAnalytics(): AnalyticsEvent[] {
    return this.analytics;
  }
}

export const db = new InMemoryStore();
