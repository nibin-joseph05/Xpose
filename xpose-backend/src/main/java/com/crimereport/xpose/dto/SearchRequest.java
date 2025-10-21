package com.crimereport.xpose.dto;

import java.util.Map;

class SearchRequest {
    private String query;
    private Map<String, Object> filters;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Map<String, Object> getFilters() { return filters; }
    public void setFilters(Map<String, Object> filters) { this.filters = filters; }
}