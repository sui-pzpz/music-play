package com.xx.music.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePlaylistDTO {

    @Size(min = 1, max = 30)
    private String name;

    @Size(max = 200)
    private String description;

    private String cover;

    private Boolean isPublic;

    private List<String> tags;
}
