package com.xx.music.model.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class UpdateSongDTO {

    private String name;

    private List<@Valid CreateSongDTO.ArtistItem> artistIds;

    private String albumId;

    private Integer duration;

    private Boolean isVip;

    private List<String> qualities;
}
