package com.xx.music.model.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AddSongsDTO {

    @NotEmpty(message = "歌曲列表不能为空")
    private List<String> songIds;

    public List<String> getSongIds() {
        return this.songIds;
    }

    public void setSongIds(List<String> songIds) {
        this.songIds = songIds;
    }
}
