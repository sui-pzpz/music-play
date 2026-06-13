package com.xx.music.model.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class UpdateSongDTO {

    private String name;

    private List<CreateSongDTO.ArtistItem> artistIds;

    private String albumId;

    private Integer duration;

    private Boolean isVip;

    private List<String> qualities;

    private Integer hasStandard;

    private Integer hasHigh;

    private Integer hasLossless;

    private Integer status;

    private String lyricUrl;

    private String tlyricUrl;

    private String source;

    private String sourceId;

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<CreateSongDTO.ArtistItem> getArtistIds() {
        return this.artistIds;
    }

    public void setArtistIds(List<CreateSongDTO.ArtistItem> artistIds) {
        this.artistIds = artistIds;
    }

    public String getAlbumId() {
        return this.albumId;
    }

    public void setAlbumId(String albumId) {
        this.albumId = albumId;
    }

    public Integer getDuration() {
        return this.duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Boolean getIsVip() {
        return this.isVip;
    }

    public void setIsVip(Boolean isVip) {
        this.isVip = isVip;
    }

    public List<String> getQualities() {
        return this.qualities;
    }

    public void setQualities(List<String> qualities) {
        this.qualities = qualities;
    }

    public Integer getHasStandard() {
        return this.hasStandard;
    }

    public void setHasStandard(Integer hasStandard) {
        this.hasStandard = hasStandard;
    }

    public Integer getHasHigh() {
        return this.hasHigh;
    }

    public void setHasHigh(Integer hasHigh) {
        this.hasHigh = hasHigh;
    }

    public Integer getHasLossless() {
        return this.hasLossless;
    }

    public void setHasLossless(Integer hasLossless) {
        this.hasLossless = hasLossless;
    }

    public Integer getStatus() {
        return this.status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getLyricUrl() {
        return this.lyricUrl;
    }

    public void setLyricUrl(String lyricUrl) {
        this.lyricUrl = lyricUrl;
    }

    public String getTlyricUrl() {
        return this.tlyricUrl;
    }

    public void setTlyricUrl(String tlyricUrl) {
        this.tlyricUrl = tlyricUrl;
    }

    public String getSource() {
        return this.source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSourceId() {
        return this.sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }
}
