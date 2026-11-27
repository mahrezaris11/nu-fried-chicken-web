/**
 * Data resmi Nu Fried Chicken & Burger
 * Sumber tunggal: PROPOSAL KEMITRAAN NU FRIED CHICKEN 2026.pdf
 */
window.NU_DATA = {
  brand: {
    name: 'Nu Fried Chicken & Burger',
    shortName: 'Nu Chicken',
    company: 'PT. Dua Barokah Sejahtera (DBRO Chicken & Burger)',
    established: '2022',
    tagline: 'Rasa Asli Pilihan Indonesia!',
    whatsappNumber: '6282122189927',
    whatsappDisplay: '0821-2218-9927',
    orderWhatsappDisplay: '0821 7377 822',
    website: 'www.nufriedchicken.com',
    socialHandle: 'nu.chickenofficial',
    proposalFile: './PROPOSAL KEMITRAAN NU FRIED CHICKEN 2026.pdf',
  },

  // Konstanta proyeksi keuangan PDF halaman 11:
  // 10 ekor/hari = Rp 7.350.000/bln -> Rp 735.000/bln per 1 ekor/hari
  // 20 ekor/hari = Rp 14.700.000/bln
  // 50 ekor/hari = Rp 36.750.000/bln
  gpPerDailyBirdMonthly: 735000,

  media: {
    heroImage: './assets/images/hero-duo.jpg',
    outletImages: [
      './assets/images/outlet-grand-opening-1.jpg',
      './assets/images/outlet-grand-opening-2.jpg',
      './assets/images/outlet-crowd.jpg',
    ],
    mapImage: './assets/images/area-mitra-map.jpg',
  },

  promo: {
    active: true,
    image: './assets/images/outlet-grand-opening-1.jpg',
    badge: 'Promo Kemitraan 2026',
    title: 'Gratis Survey Lokasi & Dukungan Media Promo Grand Opening!',
    subtitle:
      'Bergabung sekarang dan dapatkan pendampingan survey kelayakan lokasi langsung dari tim kami serta paket lengkap Branding & Media Promo (balon logo, banner, brosur GO, foto & design promo) untuk Paket Medium Outlet, Container, dan Mini Resto.',
    highlightLabel: 'Free Survey Lokasi + Media Promo GO',
    validUntil: 'Berlaku untuk Pendaftaran Kemitraan 2026',
    ctaText: 'Klaim Konsultasi Promo via WhatsApp',
    waMessage:
      'Halo Tim Nu Fried Chicken & Burger, saya ingin klaim konsultasi Promo Kemitraan 2026 dan info survey lokasi.',
  },

  packages: [
    {
      id: 'gerobak',
      name: 'Paket Gerobak',
      price: 16000000,
      priceLabel: '16',
      priceUnit: 'JUTA',
      badge: 'Modal Ekonomis',
      popular: false,
      tagline: 'Langkah awal praktis untuk memulai usaha ayam goreng & burger krispi.',
      image: './assets/images/booth-gerobak.jpg',
      unitName: 'Gerobak',
      material: 'Aluminium',
      dimensions: '150 x 79 x 192 cm',
      hasBrandingPromo: false,
      facilities: [
        {
          group: 'Gerobak',
          items: ['Material Aluminium', 'Dimensi 150 x 79 x 192 cm'],
        },
        {
          group: 'Peralatan & Perlengkapan',
          items: ['Peralatan dapur lengkap', 'Packaging siap jual', 'Perlengkapan pendukung (DLL)'],
        },
        {
          group: 'Bahan Baku Awal',
          items: ['Ayam fresh marinasi', 'Tepung berbumbu', 'Minyak padat & bumbu awal (DLL)'],
        },
        {
          group: 'Branding & Media Promo',
          items: ['Desain gerobak standar Nu Chicken', 'Upgrade paket media promo tersedia'],
        },
      ],
      bep: {
        10: '± 2,2 bulan',
        20: '± 1,1 bulan',
        50: '± 0,4 bulan',
      },
    },
    {
      id: 'medium',
      name: 'Paket Medium Outlet',
      price: 23000000,
      priceLabel: '23',
      priceUnit: 'JUTA',
      badge: 'Paling Diminati',
      popular: true,
      tagline: 'Paket terfavorit dengan Hot Display Stainless Steel plus paket lengkap branding & promo.',
      image: './assets/images/booth-medium.jpg',
      unitName: 'Hot Display',
      material: 'Aluminium & Stainless Steel',
      dimensions: '100 x 90 x 100 cm',
      hasBrandingPromo: true,
      facilities: [
        {
          group: 'Hot Display',
          items: ['Material Stainless Steel (Unit Aluminium)', 'Dimensi 100 x 90 x 100 cm'],
        },
        {
          group: 'Peralatan & Perlengkapan',
          items: ['Peralatan dapur lengkap', 'Packaging siap jual', 'Perlengkapan pendukung (DLL)'],
        },
        {
          group: 'Bahan Baku Awal',
          items: ['Ayam fresh marinasi', 'Tepung berbumbu', 'Minyak padat & bumbu awal (DLL)'],
        },
        {
          group: 'Branding & Media Promo',
          items: ['Balon logo', 'Banner & Brosur Grand Opening (GO)', 'Foto produk & Design promo'],
        },
      ],
      bep: {
        10: '± 3,1 bulan',
        20: '± 1,6 bulan',
        50: '± 0,6 bulan',
      },
    },
    {
      id: 'container',
      name: 'Paket Container',
      price: 60000000,
      priceLabel: '60',
      priceUnit: 'JUTA',
      badge: 'Outlet Modern',
      popular: false,
      tagline: 'Konsep kontainer ikonik berkapasitas besar untuk lokasi strategis & area komersial.',
      image: './assets/images/booth-container.jpg',
      unitName: 'Container',
      material: 'Bondeck & Stainless Steel',
      dimensions: '250 x 300 x 250 cm',
      hasBrandingPromo: true,
      facilities: [
        {
          group: 'Container',
          items: ['Material Bondeck & Stainless Steel', 'Dimensi 250 x 300 x 250 cm'],
        },
        {
          group: 'Peralatan & Perlengkapan',
          items: ['Peralatan dapur lengkap', 'Packaging siap jual', 'Perlengkapan pendukung (DLL)'],
        },
        {
          group: 'Bahan Baku Awal',
          items: ['Ayam fresh marinasi', 'Tepung berbumbu', 'Minyak padat & bumbu awal (DLL)'],
        },
        {
          group: 'Branding & Media Promo',
          items: ['Balon logo', 'Banner & Brosur Grand Opening (GO)', 'Foto produk & Design promo'],
        },
      ],
      bep: {
        10: '± 8,2 bulan',
        20: '± 4,1 bulan',
        50: '± 1,6 bulan',
      },
    },
    {
      id: 'miniresto',
      name: 'Paket Mini Resto',
      price: 90000000,
      priceLabel: '90',
      priceUnit: 'JUTA',
      badge: 'Skala Resto',
      popular: false,
      tagline: 'Solusi outlet dine-in berkapasitas penuh dengan desain modern yang menyesuaikan lokasi.',
      image: './assets/images/booth-miniresto.jpg',
      unitName: 'Mini Resto',
      material: 'Menyesuaikan',
      dimensions: 'Menyesuaikan',
      hasBrandingPromo: true,
      facilities: [
        {
          group: 'Mini Resto',
          items: ['Material & Dimensi menyesuaikan lokasi', 'Konsep outlet representatif & dine-in'],
        },
        {
          group: 'Peralatan & Perlengkapan',
          items: ['Peralatan dapur lengkap', 'Packaging siap jual', 'Perlengkapan pendukung (DLL)'],
        },
        {
          group: 'Bahan Baku Awal',
          items: ['Ayam fresh marinasi', 'Tepung berbumbu', 'Minyak padat & bumbu awal (DLL)'],
        },
        {
          group: 'Branding & Media Promo',
          items: ['Balon logo', 'Banner & Brosur Grand Opening (GO)', 'Foto produk & Design promo'],
        },
      ],
      bep: {
        10: '± 12,2 bulan',
        20: '± 6,1 bulan',
        50: '± 2,4 bulan',
      },
    },
  ],

  menuCategories: [
    { id: 'all', label: 'Semua Menu' },
    { id: 'fried-chicken', label: 'Fried Chicken & Sambal' },
    { id: 'burger', label: 'Burger Series' },
    { id: 'hot-chicken', label: 'Spesial Hot Chicken' },
    { id: 'paket-hemat', label: 'Paket Nu Box & Kids' },
    { id: 'bowl-korean', label: 'Rice Bowl, Korean & Pasta' },
    { id: 'alacarte-minuman', label: 'Ala Carte, Minuman & Add On' },
  ],

  menuItems: [
    {
      id: 'fried-chicken',
      category: 'fried-chicken',
      name: 'Fried Chicken Original',
      badge: 'Signature Crispy',
      badgeColor: 'red',
      priceStart: 'Rp 9.000',
      image: './assets/images/menu-fried-chicken.jpg',
      description: 'Ayam goreng krispi dengan balutan tepung berbumbu rahasia yang renyah di luar dan juicy di dalam.',
      variants: [
        { label: 'Sayap', price: 'Rp 9.000' },
        { label: 'Paha Bawah', price: 'Rp 9.000' },
        { label: 'Dada / Paha Atas', price: 'Rp 11.500' },
      ],
    },
    {
      id: 'nu-prek',
      category: 'fried-chicken',
      name: 'Nu Prek Sambal',
      badge: 'Sambal Merah / Ijo',
      badgeColor: 'orange',
      priceStart: 'Rp 12.500',
      image: './assets/images/menu-nuprek.jpg',
      description: 'Ayam goreng geprek krispi dengan pilihan Sambal Merah pedas nikmat atau Sambal Ijo segar.',
      variants: [
        { label: 'Sayap', price: 'Rp 12.500 (+Nasi 17rb | +Minum 19rb)' },
        { label: 'Paha Bawah', price: 'Rp 13.500 (+Nasi 17rb | +Minum 20rb)' },
        { label: 'Dada / Paha Atas', price: 'Rp 15.000 (+Nasi 19rb | +Minum 22rb)' },
      ],
    },
    {
      id: 'bangnu',
      category: 'fried-chicken',
      name: 'BangNu (Ayam Satu Ekor Utuh)',
      badge: 'Favorit Keluarga',
      badgeColor: 'yellow',
      priceStart: 'Rp 69.000',
      image: './assets/images/menu-bangnu.jpg',
      description: '1 ekor ayam utuh goreng krispi porsi keluarga dengan pilihan rasa Original atau Spicy.',
      variants: [
        { label: 'BangNu Original', price: 'Rp 69.000' },
        { label: 'BangNu Spicy', price: 'Rp 72.000' },
        { label: 'Add On Saus / Sambal', price: '+Rp 5.000' },
      ],
    },
    {
      id: 'burger-series',
      category: 'burger',
      name: 'Burger Series (Beef & Chicken)',
      badge: 'Lini Andalan',
      badgeColor: 'yellow',
      priceStart: 'Rp 11.000',
      image: './assets/images/menu-burger.jpg',
      description: 'Roti bun lembut dengan patty daging pilihan, sayuran segar, dan keju lumer. Bisa tambah paket Kentang & Minum!',
      variants: [
        { label: 'Nu Burger / Nusis', price: 'Rp 11.000 (+Kentang & Minum 18rb)' },
        { label: 'Reguler (Beef Only)', price: 'Rp 13.000 (+Kentang & Minum 22rb)' },
        { label: 'Cheese Burger', price: 'Rp 15.000 (+Kentang & Minum 23rb)' },
        { label: 'Premium Burger', price: 'Rp 16.000 (+Kentang & Minum 24rb)' },
        { label: 'Premium Cheese', price: 'Rp 18.000 (+Kentang & Minum 26rb)' },
      ],
    },
    {
      id: 'sayhot',
      category: 'hot-chicken',
      name: 'Sayhot (Hot Chicken Level 1–3)',
      badge: 'Pilih Level 1–3',
      badgeColor: 'red',
      priceStart: 'Rp 13.500',
      image: './assets/images/menu-hot-chicken.jpg',
      description: 'Ayam krispi balut saus pedas spesial Sayhot dengan tingkat kepedasan Level 1 hingga Level 3.',
      variants: [
        { label: 'Sayap / Paha Bawah', price: 'Rp 13.500 (+Nasi 16rb/16,5rb | +Minum 19rb)' },
        { label: 'Sayap Potongan', price: 'Rp 15.000 (+Nasi 18rb | +Minum 21rb)' },
        { label: 'Dada / Paha Atas', price: 'Rp 15.500 (+Nasi 18,5rb | +Minum 21rb)' },
        { label: 'BangNu Sayhot (1 Ekor)', price: 'Rp 79.000' },
      ],
    },
    {
      id: 'cilupba',
      category: 'hot-chicken',
      name: 'Cilupba (Chicken Cilup Bakar)',
      badge: 'Pilih Level 1–3',
      badgeColor: 'orange',
      priceStart: 'Rp 14.500',
      image: './assets/images/menu-hot-chicken.jpg',
      description: 'Sensasi ayam krispi celup bumbu bakar manis pedas khas Nu Fried Chicken (Level 1–3).',
      variants: [
        { label: 'Sayap / Paha Bawah', price: 'Rp 14.500 (+Nasi 18rb | +Minum 22rb)' },
        { label: 'Dada / Paha Atas', price: 'Rp 17.500 (+Nasi 21rb | +Minum 25rb)' },
        { label: 'BangNu Cilupba (1 Ekor)', price: 'Rp 79.000' },
      ],
    },
    {
      id: 'paket-nu-box',
      category: 'paket-hemat',
      name: 'Paket Nu Box (Nu 1 – Nu 6)',
      badge: 'Terlaris',
      badgeColor: 'red',
      priceStart: 'Rp 13.000',
      image: './assets/images/menu-nubox.jpg',
      description: 'Paket box praktis berisi nasi hangat, ayam krispi pilihan, dan opsi minuman segar untuk makan siang cepat.',
      variants: [
        { label: 'Paket Nu 1 (1 Nasi + 1 Sayap)', price: 'Rp 13.000' },
        { label: 'Paket Nu 2 (1 Nasi + 1 Paha Bawah)', price: 'Rp 13.000' },
        { label: 'Paket Nu 3 (1 Nasi + 1 Dada/Paha Atas)', price: 'Rp 15.000' },
        { label: 'Paket Nu 4 (1 Nasi + 1 Sayap + Minum)', price: 'Rp 15.000' },
        { label: 'Paket Nu 5 (1 Nasi + 1 Paha Bawah + Minum)', price: 'Rp 16.000' },
        { label: 'Paket Nu 6 (1 Nasi + 1 Dada/Paha Atas + Minum)', price: 'Rp 18.000' },
      ],
    },
    {
      id: 'nu-kids',
      category: 'paket-hemat',
      name: 'Paket Nu Kids',
      badge: 'Menu Anak',
      badgeColor: 'yellow',
      priceStart: 'Rp 18.000',
      image: './assets/images/menu-nubox.jpg',
      description: 'Paket lengkap ramah anak yang disukai keluarga: 1 Nasi, 1 Paha Bawah krispi, dan 1 Susu Cokelat.',
      variants: [
        { label: '1 Nasi + 1 Paha Bawah + 1 Susu Cokelat', price: 'Rp 18.000' },
      ],
    },
    {
      id: 'rice-bowl',
      category: 'bowl-korean',
      name: 'Rice Bowl Series',
      badge: 'Serba 11 Ribu',
      badgeColor: 'orange',
      priceStart: 'Rp 11.000',
      image: './assets/images/menu-bowl.jpg',
      description: 'Nasi mangkuk praktis dengan topping melimpah dan saus gurih favorit anak muda.',
      variants: [
        { label: 'Rice Bowl Chicken', price: 'Rp 11.000' },
        { label: 'Rice Bowl Beef', price: 'Rp 11.000' },
        { label: 'Rice Bowl Sosis', price: 'Rp 11.000' },
        { label: 'Rice Bowl Kulit', price: 'Rp 11.000' },
      ],
    },
    {
      id: 'korean-food',
      category: 'bowl-korean',
      name: 'Korean Food Series',
      badge: 'Kekinian',
      badgeColor: 'red',
      priceStart: 'Rp 16.000',
      image: './assets/images/menu-korean.jpg',
      description: 'Menu jajanan ala Korea favorit pelanggan muda untuk mendongkrak variasi omzet outlet.',
      variants: [
        { label: 'Toppoki Medium', price: 'Rp 16.000' },
        { label: 'Rabboki Reguler', price: 'Rp 16.000' },
        { label: 'Odeng Seafood', price: 'Rp 16.000' },
      ],
    },
    {
      id: 'spaghetti',
      category: 'bowl-korean',
      name: 'Spaghetti Bolognese',
      badge: 'Favorit Remaja',
      badgeColor: 'yellow',
      priceStart: 'Rp 10.000',
      image: './assets/images/menu-sides-drinks.jpg',
      description: 'Pasta spaghetti dengan saus bolognese gurih yang cocok dinikmati kapan saja.',
      variants: [
        { label: 'Spaghetti Bolognese', price: 'Rp 10.000' },
        { label: 'Spaghetti & Minum', price: 'Rp 14.500' },
      ],
    },
    {
      id: 'alacarte-minuman',
      category: 'alacarte-minuman',
      name: 'Ala Carte, Minuman & Add On',
      badge: 'Pelengkap',
      badgeColor: 'orange',
      priceStart: 'Rp 5.000',
      image: './assets/images/menu-sides-drinks.jpg',
      description: 'Beragam camilan renyah, aneka minuman segar, dan saus pelengkap untuk memperbesar nilai transaksi.',
      variants: [
        { label: 'Ala Carte', price: 'Nasi 5rb | Kentang 7rb | Kulit 7rb | Mie Prek 10rb | Dimsum 15rb' },
        { label: 'Minuman 5rb–6rb', price: 'Air Mineral / Teh Kotak / S-Tee / Teh Pucuk 5rb | Orange / Milo 6rb' },
        { label: 'Susu Ultra', price: 'Rp 6.500' },
        { label: 'Add On (Rp 5.000)', price: 'Saus Keju / Saus Sayhot / Sambal NuPrek' },
      ],
    },
  ],

  onboardingSteps: [
    {
      step: '01',
      title: 'Hubungi WhatsApp Nu Chicken',
      desc: 'Isi data diri dan konfirmasi bahwa Anda siap menjadi mitra melalui WhatsApp resmi kami di 0821-2218-9927.',
    },
    {
      step: '02',
      title: 'Shareloc & Dokumentasi',
      desc: 'Kirimkan shareloc serta foto/video dokumentasi lokasi usaha yang akan Anda tempati.',
    },
    {
      step: '03',
      title: 'Survey Lokasi',
      desc: 'Tim survey kami akan mendatangi langsung dan mengevaluasi potensi lokasi yang Anda kirimkan.',
    },
    {
      step: '04',
      title: 'Pilih Paket Kemitraan',
      desc: 'Pilih paket usaha yang sesuai (Gerobak, Medium Outlet, Container, atau Mini Resto) dan isi formulir perjanjian kerjasama.',
    },
    {
      step: '05',
      title: 'Training & Test',
      desc: 'Mitra wajib mengikuti training operasional selama minimal 1 pekan dan menjalani test uji kelayakan.',
    },
    {
      step: '06',
      title: 'Pengiriman Booth & Opening',
      desc: 'Setelah pembayaran selesai, booth serta perlengkapan lengkap dikirimkan dan outlet Anda siap beroperasi.',
    },
  ],

  partnerAreas: [
    { region: 'Jakarta', outlets: ['Nu Chicken Kramat Jati', 'Nu Chicken Tebet', 'Nu Chicken Tomang', 'Nu Chicken Cijantung'] },
    { region: 'Bogor', outlets: ['Nu Chicken Kota Wisata', 'Nu Chicken Metland Cileungsi', 'Nu Chicken Cileungsi', 'Nu Chicken Citra Indah Cileungsi', 'Nu Chicken Klapanunggal', 'Nu Chicken Katulampa'] },
    { region: 'Depok', outlets: ['Nu Chicken RTM', 'Nu Chicken Rawakalong'] },
    { region: 'Tangerang', outlets: ['Nu Chicken Binong Permai'] },
    { region: 'Karawang', outlets: ['Nu Chicken Unsika', 'Nu Chicken Villa Karawangi'] },
  ],

  faqs: [
    {
      q: 'Berapa modal awal yang dibutuhkan untuk bergabung menjadi mitra Nu Fried Chicken & Burger?',
      a: 'Tersedia 4 pilihan paket kemitraan fleksibel sesuai skala usaha: Paket Gerobak (Rp 16 Juta), Paket Medium Outlet (Rp 23 Juta), Paket Container (Rp 60 Juta), dan Paket Mini Resto (Rp 90 Juta).',
    },
    {
      q: 'Apa saja fasilitas yang sudah didapatkan mitra di awal?',
      a: 'Seluruh paket sudah termasuk unit booth/outlet sesuai paket pilihan, peralatan & perlengkapan (peralatan dapur & packaging), serta bahan baku awal (ayam fresh marinasi, tepung berbumbu, minyak padat, dll). Khusus Paket Medium Outlet, Container, dan Mini Resto juga sudah dilengkapi Branding & Media Promo (balon logo, banner, brosur Grand Opening, foto produk, dan design promo).',
    },
    {
      q: 'Bagaimana sistem pasokan bahan baku untuk menjaga konsistensi rasa?',
      a: 'Nu Fried Chicken & Burger menyediakan bahan baku utama standar seperti ayam fresh marinasi, tepung berbumbu, dan minyak padat agar cita rasa asli pilihan Indonesia tetap konsisten di setiap outlet mitra.',
    },
    {
      q: 'Apakah calon mitra mendapatkan pelatihan sebelum outlet dibuka?',
      a: 'Ya! Berdasarkan alur resmi kemitraan, setiap mitra wajib mengikuti program Training selama minimal 1 pekan dan menjalani Test Uji Kelayakan sebelum pengiriman booth dan pembukaan outlet.',
    },
    {
      q: 'Apakah tim Nu Fried Chicken membantu pengecekan lokasi usaha?',
      a: 'Tentu. Setelah Anda mengirimkan shareloc dan dokumentasi lokasi, tim survey kami akan turun langsung mendatangi dan mensurvey kelayakan lokasi yang Anda ajukan sebelum penandatanganan kerjasama.',
    },
    {
      q: 'Berapa lama estimasi balik modal (Break Even Point / BEP)?',
      a: 'Berdasarkan simulasi proposal resmi (Gross Profit Rp 7.350.000/bulan untuk 10 ekor/hari, Rp 14.700.000/bulan untuk 20 ekor/hari, dan Rp 36.750.000/bulan untuk 50 ekor/hari), estimasi BEP berkisar mulai ± 0,4 hingga 2,2 bulan untuk Paket Gerobak, ± 0,6 hingga 3,1 bulan untuk Paket Medium Outlet, ± 1,6 hingga 8,2 bulan untuk Paket Container, dan ± 2,4 hingga 12,2 bulan untuk Paket Mini Resto.',
    },
  ],
};
