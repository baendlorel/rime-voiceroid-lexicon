declare type Entry = [string, string, ...strings: string[]];
declare type EntryWithWeight = [string, string, ...strings: string[], weight: number];

declare interface LexiconOptions {
  sort?: string;
  name?: string;
  version?: string;
}

declare type Lexicon = {
  list: (Entry | EntryWithWeight)[];
} & LexiconOptions;

declare function create(
  entries: (Entry | EntryWithWeight)[],
  options?: LexiconOptions
): Lexicon;
