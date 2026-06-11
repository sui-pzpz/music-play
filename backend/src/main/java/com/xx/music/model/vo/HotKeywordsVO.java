package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class HotKeywordsVO {

    private List<HotKeyword> keywords;

    @Data
    public static class HotKeyword {

        private String keyword;
        private int hot;
    }
}
