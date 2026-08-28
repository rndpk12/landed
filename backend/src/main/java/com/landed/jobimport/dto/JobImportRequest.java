package com.landed.jobimport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record JobImportRequest(
        @NotBlank @URL(protocol = "https") @Size(max = 2048) String url
) {
}
