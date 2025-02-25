export const API_ENDPOINTS = {
  dictionary: function (word: string) {
    return `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  },
  images: function (word: string) {
    return `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=images&prop=imageinfo&gimlimit=500&redirects=1&titles=${word}&iiprop=timestamp|user|userid|comment|canonicaltitle|url|size|dimensions|sha1|mime|thumbmime|mediatype|bitdepth`;
  },
};
