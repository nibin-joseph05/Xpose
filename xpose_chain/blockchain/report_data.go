package blockchain

type ReportData struct {
    ReportID    string `json:"reportId"`
    CategoryID  int    `json:"categoryId"`
    Description string `json:"description"`
    Address     string `json:"address"`
    City        string `json:"city"`
    State       string `json:"state"`
    Country     string `json:"country"`
    SubmittedAt string `json:"submittedAt"`
}
