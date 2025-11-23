export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: "O'zbek",
    flag: '🇺🇿',
  },
];

export type LanguageSwitcherVariant =
  | 'default'
  | 'compact'
  | 'icon-only'
  | 'sub-menu';
