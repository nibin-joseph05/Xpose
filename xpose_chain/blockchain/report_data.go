package blockchain

type ReportData struct {
    ReportID    string `json:"reportId"`
    CategoryID  int    `json:"categoryId"`
    CrimeTypeID    int    `json:"crimeTypeId"`
    Description string `json:"description"`
    TranslatedText  string `json:"translatedText"`
    Address     string `json:"address"`
    City        string `json:"city"`
    State       string `json:"state"`
    Country     string `json:"country"`
    SubmittedAt string `json:"submittedAt"`
}
