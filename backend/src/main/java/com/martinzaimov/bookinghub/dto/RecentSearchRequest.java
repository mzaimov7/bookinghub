package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;

public class RecentSearchRequest {
    public String query;
    public String city;
    public Long categoryId;
    public BigDecimal minPrice;
    public BigDecimal maxPrice;
}
