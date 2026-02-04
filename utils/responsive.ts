/*
  Defines image configuration to display image responsive for some specifics cases.
*/
export const imageConfiguration = {
  productList: {
    sizes:
      '(min-width: 1440px) 306px, (min-width: 1040px) calc(20vw + 22px), (min-width: 640px) calc(33.42vw - 31px), calc(50vw - 20px)',
  },
  lightboxImage: {
    thumbnail: {
      sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 20vw, 33vw',
    },
    large: { sizes: '(min-width: 640px) 50vw, 100vw' },
  },
  banners: {
    1: {
      sizes: '(min-width: 1420px) 1314px, 94vw',
    },
    2: {
      sizes:
        '(min-width: 1440px) 642px, (min-width: 1040px) calc(40vw + 74px), calc(98.61vw - 16px)',
    },
    3: {
      sizes:
        '(min-width: 1440px) 418px, (min-width: 1040px) calc(26.58vw + 41px), calc(98.61vw - 16px)',
    },
    4: {
      sizes:
        '(min-width: 1440px) 306px, (min-width: 1040px) calc(40vw + 74px), calc(98.61vw - 16px)',
    },
  },
};
