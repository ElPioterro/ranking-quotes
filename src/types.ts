export interface Image {
  id: number;
  url: string;
  elo: number;
}

export interface HistoryEntry {
  images: Image[];
}
