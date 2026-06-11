package com.xx.music.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePlaylistDTO {

    @NotBlank(message = "歌单名称不能为空")
    @Size(min = 1, max = 30, message = "歌单名称1-30字")
    private String name;

    @Size(max = 200)
    private String description;

    private Boolean isPublic;

    private List<String> tags;
}
