export const filterDisasterData =
  [
    {
      id: 1,
      jenis_bencana: 'gempa_bumi',
      label: 'Gempa Bumi',
      iconSelected: require('../assets/images/gempaActive.png'),
      iconUnselected: {
        light: require('../assets/images/gempaDeactive.png'),
        dark: require('../assets/images/gempaDeactive-dark.png'),
      },
    },
    {
      id: 2,
      jenis_bencana: 'tsunami',
      label: 'Tsunami',
      iconSelected: require('../assets/images/tsunamiActive.png'),
      iconUnselected: {
        light: require('../assets/images/tsunamiDeactive.png'),
        dark: require('../assets/images/tsunamiDeactive-dark.png'),
      },
    },
    {
      id: 3,
      jenis_bencana: 'banjir',
      label: 'Banjir',
      iconSelected: require('../assets/images/banjirActive.png'),
      iconUnselected: {
        light: require('../assets/images/banjirDeactive.png'),
        dark: require('../assets/images/banjirDeactive-dark.png'),
      },
    },
    {
      id: 4,
      jenis_bencana: 'longsor',
      label: 'Longsor',
      iconSelected: require('../assets/images/longsorActive.png'),
      iconUnselected: {
        light: require('../assets/images/longsorActive.png'),
        dark: require('../assets/images/longsorDeactive-dark.png'),
      },
    },
    {
      id: 5,
      jenis_bencana: 'gunung_berapi',
      label: 'Erupsi Gn. Berapi',
      iconSelected: require('../assets/images/erupsiActive.png'),
      iconUnselected: {
        light: require('../assets/images/erupsiDeactive.png'),
        dark: require('../assets/images/erupsiDeactive-dark.png'),
      },
    },
  ];
