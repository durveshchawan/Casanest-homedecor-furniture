/* ==========================================================================
   CasaNest — Product catalogue (demo data)
   Plain JS object array. No backend, no database — everything lives here.
   Images load from Unsplash; if offline, store.js swaps in a fallback.
   ========================================================================== */

const CATEGORIES = [
  "Living Room", "Bedroom", "Dining Room", "Lighting", "Wall Decor",
  "Rugs", "Storage", "Plants", "Decor Accessories"
];

// Short helper to keep the Unsplash URLs tidy
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;

const PRODUCTS = [
  {
    id: "p01", name: "Halden Boucle Armchair", category: "Living Room",
    price: 36460, oldPrice: 46660, rating: 4.8, reviews: 126, stock: true, badge: "sale",
    colors: [{ name: "Cream", hex: "#EDE6D8" }, { name: "Sand", hex: "#D9C7A3" }, { name: "Charcoal", hex: "#3a3a3a" }],
    images: [U("1586023492125-27b2c045efd7"), U("1567016376408-0226e4d0c1ea"), U("1519710164239-da123dc03ef4")],
    desc: "A sculptural lounge chair wrapped in soft bouclé, built on a solid oak frame. Deep enough to sink into, refined enough to anchor a room.",
    specs: { Material: "Bouclé, solid oak", Dimensions: "78 × 82 × 90 cm", Weight: "18 kg", Seat: "Foam + feather blend", Assembly: "Legs only", Warranty: "5 years" }
  },
  {
    id: "p02", name: "Lumen Arc Floor Lamp", category: "Lighting",
    price: 16060, oldPrice: 20320, rating: 4.7, reviews: 88, stock: true, badge: "sale",
    colors: [{ name: "Brass", hex: "#b08d57" }, { name: "Matte Black", hex: "#2b2b2b" }],
    images: [U("1507473885765-e6ed057f782c"), U("1513506003901-1e6a229e2d15"), U("1524758631624-e2822e304c36")],
    desc: "An arched brass lamp that reaches gracefully over a sofa or reading nook, casting a warm, diffused glow from a fabric drum shade.",
    specs: { Material: "Brushed brass, marble base", Height: "205 cm", Bulb: "E27, max 40W", Cord: "2.4 m", Switch: "Foot dimmer", Warranty: "2 years" }
  },
  {
    id: "p03", name: "Terra Handwoven Rug", category: "Rugs",
    price: 22020, oldPrice: 27960, rating: 4.9, reviews: 214, stock: true, badge: "new",
    colors: [{ name: "Terracotta", hex: "#b56a4a" }, { name: "Ivory", hex: "#F5F1EB" }, { name: "Olive", hex: "#7d7a52" }],
    images: [U("1600166898405-da9535204843"), U("1616486338812-3dadae4b4ace"), U("1584285405429-136bf988919c")],
    desc: "Hand-knotted from New Zealand wool with a low, dense pile and a soft geometric motif. A quiet foundation for any living space.",
    specs: { Material: "100% wool", Size: "170 × 240 cm", Pile: "8 mm low pile", Backing: "Cotton canvas", Care: "Professional clean", Origin: "Handmade in India" }
  },
  {
    id: "p04", name: "Olive Ceramic Vase Set", category: "Decor Accessories",
    price: 5440, oldPrice: 7560, rating: 4.6, reviews: 73, stock: true, badge: "sale",
    colors: [{ name: "Sage", hex: "#9caf88" }, { name: "Terracotta", hex: "#b56a4a" }],
    images: [U("1578500494198-246f612d3b3d"), U("1602874801007-bd458bb1b8b6"), U("1493663284031-b7e3aefcae8e")],
    desc: "A trio of matte stoneware vases in graduated heights. Beautiful grouped on a mantel, or standing alone with a single stem.",
    specs: { Material: "Glazed stoneware", Heights: "12 / 18 / 24 cm", Finish: "Matte", Watertight: "Yes", Pieces: "3", Care: "Wipe clean" }
  },
  {
    id: "p05", name: "Nordic Oak Nightstand", category: "Bedroom",
    price: 16920, oldPrice: 21160, rating: 4.7, reviews: 51, stock: true, badge: "",
    colors: [{ name: "Natural Oak", hex: "#c9a978" }, { name: "Walnut", hex: "#6b4b32" }],
    images: [U("1611967164521-abae8fba4668"), U("1522771739844-6a9f6d5f14af"), U("1540638349517-3abd5afc5847")],
    desc: "A compact bedside table with a soft-close drawer and an open shelf. Rounded edges and a warm oak veneer keep it feeling calm.",
    specs: { Material: "Oak veneer, MDF", Dimensions: "45 × 40 × 50 cm", Drawer: "1 soft-close", Shelf: "1 open", Assembly: "Required (~20 min)", Warranty: "3 years" }
  },
  {
    id: "p06", name: "Solace Linen Bedding Set", category: "Bedroom",
    price: 12660, oldPrice: 16920, rating: 4.9, reviews: 302, stock: true, badge: "sale",
    colors: [{ name: "Oatmeal", hex: "#d8cdb8" }, { name: "Clay", hex: "#c08a6e" }, { name: "Sage", hex: "#9caf88" }],
    images: [U("1522771739844-6a9f6d5f14af"), U("1616594039964-ae9021a400a0"), U("1616627561950-9f746e330187")],
    desc: "Stonewashed European flax linen that softens with every wash. Breathable in summer, cosy in winter. Includes duvet cover and two shams.",
    specs: { Material: "100% French flax linen", Includes: "Duvet + 2 shams", Sizes: "Queen / King", GSM: "165", Care: "Machine wash cold", Origin: "OEKO-TEX certified" }
  },
  {
    id: "p07", name: "Marble Pendant Light", category: "Lighting",
    price: 18620, oldPrice: 0, rating: 4.8, reviews: 64, stock: true, badge: "new",
    colors: [{ name: "White Marble", hex: "#efe9e0" }, { name: "Green Marble", hex: "#5f6f5a" }],
    images: [U("1524758631624-e2822e304c36"), U("1567538096630-e0c55bd6374c"), U("1513506003901-1e6a229e2d15")],
    desc: "A single dome of honed marble suspended on a slim brass stem. Each piece carries its own veining — no two are identical.",
    specs: { Material: "Honed marble, brass", Diameter: "28 cm", Drop: "Adjustable to 150 cm", Bulb: "E27, max 60W", Fitting: "Ceiling", Warranty: "2 years" }
  },
  {
    id: "p08", name: "Cane Rattan Sideboard", category: "Living Room",
    price: 46660, oldPrice: 59420, rating: 4.7, reviews: 41, stock: false, badge: "sale",
    colors: [{ name: "Natural", hex: "#c9a978" }, { name: "Espresso", hex: "#4a3527" }],
    images: [U("1533090161767-e6ffed986c88"), U("1594026112284-02bb6f3352fe"), U("1538688525198-9b88f6f53126")],
    desc: "A low storage credenza with woven cane doors and tapered legs. Hides the clutter while adding warmth and texture to a wall.",
    specs: { Material: "Mango wood, cane", Dimensions: "150 × 40 × 75 cm", Doors: "2 with shelving", Legs: "Tapered solid wood", Assembly: "Legs only", Warranty: "5 years" }
  },
  {
    id: "p09", name: "Grove Monstera Plant", category: "Plants",
    price: 4160, oldPrice: 5860, rating: 4.5, reviews: 158, stock: true, badge: "sale",
    colors: [{ name: "Stone Pot", hex: "#cfc7ba" }, { name: "Terracotta Pot", hex: "#b56a4a" }],
    images: [U("1614594975525-e45190c55d0b"), U("1466781783364-36c955e42a7f"), U("1485955900006-10f4d324d411")],
    desc: "A lush Monstera deliciosa in a matte ceramic pot, ready to display. Loves bright, indirect light and the occasional mist.",
    specs: { Species: "Monstera deliciosa", Height: "60–70 cm with pot", Pot: "Ceramic, drainage", Light: "Bright, indirect", Water: "Weekly", Pet: "Keep away from pets" }
  },
  {
    id: "p10", name: "Framed Abstract Print", category: "Wall Decor",
    price: 7560, oldPrice: 10120, rating: 4.6, reviews: 97, stock: true, badge: "",
    colors: [{ name: "Oak Frame", hex: "#c9a978" }, { name: "Black Frame", hex: "#2b2b2b" }],
    images: [U("1541961017774-22349e4a1262"), U("1513519245088-0e12902e35ca"), U("1526318472351-c75fcf070305")],
    desc: "A warm-toned abstract giclée print in a solid wood frame with museum glass. Sold ready to hang, wire fitted.",
    specs: { Print: "Giclée, archival", Size: "50 × 70 cm", Frame: "Solid wood", Glass: "Anti-glare", Mount: "Wire fitted", Origin: "Printed to order" }
  },
  {
    id: "p11", name: "Fjord Dining Chair (Set of 2)", category: "Dining Room",
    price: 23720, oldPrice: 29660, rating: 4.8, reviews: 112, stock: true, badge: "sale",
    colors: [{ name: "Camel", hex: "#c19a6b" }, { name: "Forest", hex: "#3d5343" }, { name: "Cream", hex: "#EDE6D8" }],
    images: [U("1503602642458-232111445657"), U("1506898667547-42e22a46e125"), U("1560448204-e02f11c3d0e2")],
    desc: "Upholstered dining chairs with a curved backrest and solid ash legs. Supportive for long dinners, light enough to move.",
    specs: { Material: "Fabric, solid ash", Dimensions: "52 × 55 × 82 cm", Seat: "High-density foam", Set: "2 chairs", Assembly: "Legs only", Warranty: "3 years" }
  },
  {
    id: "p12", name: "Woven Storage Basket", category: "Storage",
    price: 3820, oldPrice: 0, rating: 4.7, reviews: 189, stock: true, badge: "new",
    colors: [{ name: "Natural", hex: "#d8cdb8" }, { name: "Black Trim", hex: "#2b2b2b" }],
    images: [U("1584100936595-c0654b55a2e6"), U("1594026112284-02bb6f3352fe"), U("1522708323590-d24dbb6b0267")],
    desc: "A generous seagrass basket with leather handles — for throws, toys, or firewood. Holds its shape and softens a corner.",
    specs: { Material: "Seagrass, leather", Dimensions: "40 × 40 × 45 cm", Handles: "Genuine leather", Liner: "None", Foldable: "No", Care: "Dust regularly" }
  },
  {
    id: "p13", name: "Aria Velvet Sofa", category: "Living Room",
    price: 109650, oldPrice: 135150, rating: 4.9, reviews: 76, stock: true, badge: "sale",
    colors: [{ name: "Ochre", hex: "#c99a3f" }, { name: "Teal", hex: "#356167" }, { name: "Dove", hex: "#c9c3ba" }],
    images: [U("1493663284031-b7e3aefcae8e"), U("1555041469-a586c61ea9bc"), U("1550226891-ef816aed4a98")],
    desc: "A three-seat sofa in plush cotton velvet with feather-topped cushions and a low, contemporary profile. The centrepiece of a living room.",
    specs: { Material: "Cotton velvet, hardwood", Dimensions: "220 × 95 × 78 cm", Seats: "3", Cushions: "Feather-wrapped foam", Legs: "Solid walnut", Warranty: "10 years frame" }
  },
  {
    id: "p14", name: "Round Jute Rug", category: "Rugs",
    price: 10960, oldPrice: 13520, rating: 4.5, reviews: 63, stock: true, badge: "",
    colors: [{ name: "Natural", hex: "#d8cdb8" }],
    images: [U("1584285405429-136bf988919c"), U("1600166898405-da9535204843"), U("1616486338812-3dadae4b4ace")],
    desc: "A hand-braided jute rug with a natural, tactile weave. Hard-wearing and perfectly suited to entryways and dining nooks.",
    specs: { Material: "100% jute", Diameter: "180 cm", Pile: "Flat braided", Backing: "None", Care: "Vacuum, spot clean", Origin: "Handmade" }
  },
  {
    id: "p15", name: "Ember Scented Candle", category: "Decor Accessories",
    price: 2890, oldPrice: 0, rating: 4.8, reviews: 241, stock: true, badge: "new",
    colors: [{ name: "Amber Glass", hex: "#b5852f" }, { name: "Frosted", hex: "#e6e2da" }],
    images: [U("1602607203981-3c3c3c3c3c3c"), U("1608181831718-c9ffd8728e5a"), U("1596433809252-dc4d5b74b9c9")],
    desc: "Hand-poured soy wax in notes of amber, cedar and warm vanilla. A 50-hour burn in a reusable tinted glass vessel.",
    specs: { Wax: "Natural soy blend", Burn: "50 hours", Scent: "Amber, cedar, vanilla", Wick: "Cotton", Volume: "220 g", Vessel: "Reusable glass" }
  },
  {
    id: "p16", name: "Oslo Oak Dining Table", category: "Dining Room",
    price: 76420, oldPrice: 93420, rating: 4.9, reviews: 58, stock: true, badge: "sale",
    colors: [{ name: "Natural Oak", hex: "#c9a978" }, { name: "Smoked Oak", hex: "#6b4b32" }],
    images: [U("1617806118233-18e1de247200"), U("1533090161767-e6ffed986c88"), U("1550581190-9c1c48d21d6c")],
    desc: "A solid oak table with softly chamfered edges, seating six comfortably. Finished with a natural oil that ages beautifully.",
    specs: { Material: "Solid oak", Dimensions: "200 × 95 × 75 cm", Seats: "6", Finish: "Natural oil", Assembly: "Legs only", Warranty: "10 years" }
  },
  {
    id: "p17", name: "Linen Table Lamp", category: "Lighting",
    price: 8420, oldPrice: 10960, rating: 4.6, reviews: 44, stock: true, badge: "",
    colors: [{ name: "Sand", hex: "#D9C7A3" }, { name: "Charcoal", hex: "#3a3a3a" }],
    images: [U("1513506003901-1e6a229e2d15"), U("1507473885765-e6ed057f782c"), U("1517991104123-1d56a6e81ed9")],
    desc: "A ceramic-base table lamp with a natural linen shade. A soft pool of light for a nightstand or console.",
    specs: { Material: "Ceramic, linen shade", Height: "48 cm", Bulb: "E14, max 40W", Cord: "1.8 m", Switch: "Inline", Warranty: "2 years" }
  },
  {
    id: "p18", name: "Macramé Wall Hanging", category: "Wall Decor",
    price: 5020, oldPrice: 6720, rating: 4.7, reviews: 130, stock: true, badge: "sale",
    colors: [{ name: "Ivory", hex: "#F5F1EB" }, { name: "Taupe", hex: "#b2a48c" }],
    images: [U("1526318472351-c75fcf070305"), U("1513519245088-0e12902e35ca"), U("1541961017774-22349e4a1262")],
    desc: "Hand-knotted cotton macramé on a solid oak dowel. Adds soft texture and a handmade warmth to any bare wall.",
    specs: { Material: "Cotton, oak dowel", Dimensions: "60 × 90 cm", Mount: "Dowel + cord", Handmade: "Yes", Care: "Spot clean", Origin: "Fair-trade made" }
  },
  {
    id: "p19", name: "Stacking Storage Trunk", category: "Storage",
    price: 14880, oldPrice: 18620, rating: 4.6, reviews: 37, stock: false, badge: "",
    colors: [{ name: "Tan Leather", hex: "#a9743f" }, { name: "Cognac", hex: "#7a4a26" }],
    images: [U("1594026112284-02bb6f3352fe"), U("1584100936595-c0654b55a2e6"), U("1538688525198-9b88f6f53126")],
    desc: "A canvas-and-leather trunk that stacks or stands alone as a side table. Practical storage with an old-world travel feel.",
    specs: { Material: "Canvas, leather trim", Dimensions: "60 × 40 × 35 cm", Lid: "Hinged", Stackable: "Yes", Interior: "Cotton lined", Warranty: "2 years" }
  },
  {
    id: "p20", name: "Olive Tree in Basket", category: "Plants",
    price: 10120, oldPrice: 12660, rating: 4.8, reviews: 84, stock: true, badge: "new",
    colors: [{ name: "Woven Basket", hex: "#d8cdb8" }],
    images: [U("1485955900006-10f4d324d411"), U("1614594975525-e45190c55d0b"), U("1466781783364-36c955e42a7f")],
    desc: "A potted faux olive tree with lifelike foliage in a handwoven basket. All the Mediterranean calm, none of the upkeep.",
    specs: { Type: "Premium faux", Height: "120 cm", Pot: "Woven seagrass basket", Light: "Any", Water: "None", Assembly: "Fluff branches" }
  },
  {
    id: "p21", name: "Brass Wall Sconce", category: "Lighting",
    price: 12320, oldPrice: 0, rating: 4.7, reviews: 29, stock: true, badge: "new",
    colors: [{ name: "Antique Brass", hex: "#b08d57" }, { name: "Bronze", hex: "#6b4b32" }],
    images: [U("1567538096630-e0c55bd6374c"), U("1524758631624-e2822e304c36"), U("1507473885765-e6ed057f782c")],
    desc: "An adjustable brass reading sconce with a pivoting arm. Hardwired or plug-in, it frees up the nightstand entirely.",
    specs: { Material: "Solid brass", Reach: "35 cm arm", Bulb: "E14, max 40W", Mount: "Wall plate", Switch: "On-fixture", Warranty: "3 years" }
  },
  {
    id: "p22", name: "Quilted Throw Blanket", category: "Bedroom",
    price: 6720, oldPrice: 8420, rating: 4.9, reviews: 176, stock: true, badge: "sale",
    colors: [{ name: "Mustard", hex: "#c99a3f" }, { name: "Sage", hex: "#9caf88" }, { name: "Ivory", hex: "#F5F1EB" }],
    images: [U("1616627561950-9f746e330187"), U("1616594039964-ae9021a400a0"), U("1522771739844-6a9f6d5f14af")],
    desc: "A lightly quilted cotton throw with a subtle waffle texture. Drape it over a bed or sofa for an extra layer of comfort.",
    specs: { Material: "100% cotton", Size: "130 × 170 cm", Weight: "Mid-weight", Texture: "Waffle quilt", Care: "Machine wash", Origin: "OEKO-TEX certified" }
  },
  {
    id: "p23", name: "Round Wall Mirror", category: "Wall Decor",
    price: 14020, oldPrice: 16920, rating: 4.8, reviews: 95, stock: true, badge: "",
    colors: [{ name: "Brass Rim", hex: "#b08d57" }, { name: "Black Rim", hex: "#2b2b2b" }],
    images: [U("1618220179428-22790b461013"), U("1616627561950-9f746e330187"), U("1513519245088-0e12902e35ca")],
    desc: "A slim-framed round mirror that bounces light and opens up a hallway or bathroom. Hangs flush with a hidden bracket.",
    specs: { Material: "Metal frame, glass", Diameter: "70 cm", Depth: "3 cm", Mount: "Hidden bracket", Glass: "5 mm float", Warranty: "2 years" }
  },
  {
    id: "p24", name: "Ceramic Dinner Set (16pc)", category: "Dining Room",
    price: 16060, oldPrice: 20320, rating: 4.7, reviews: 121, stock: true, badge: "sale",
    colors: [{ name: "Speckled Cream", hex: "#e6dfce" }, { name: "Slate", hex: "#5b615f" }],
    images: [U("1578500494198-246f612d3b3d"), U("1602874801007-bd458bb1b8b6"), U("1493663284031-b7e3aefcae8e")],
    desc: "A 16-piece stoneware dinner set with a reactive glaze — plates, bowls and mugs for four. Each piece varies subtly in tone.",
    specs: { Material: "Reactive-glaze stoneware", Pieces: "16 (service for 4)", Includes: "Plates, bowls, mugs", Dishwasher: "Safe", Microwave: "Safe", Care: "Dishwasher safe" }
  }
];

// Coupons for the cart demo
const COUPONS = { CASA10: 10, WELCOME15: 15, NEST20: 20 };
