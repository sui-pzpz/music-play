package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.common.PageResult;
import com.xx.music.model.dto.UpdateProfileDTO;
import com.xx.music.model.entity.*;
import com.xx.music.model.vo.SongVO;
import com.xx.music.model.vo.UserVO;
import com.xx.music.repository.*;
import com.xx.music.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final CollectionRepository collectionRepository;
    private final SongRepository songRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;

    private static final int MAX_FAVORITES = 10000;

    @Override
    public UserVO getProfile(String uid) {
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 获取会员信息
        Member member = memberRepository.findByUid(uid).orElse(null);
        int memberLevel = 0;
        if (member != null && member.getExpireAt() != null && member.getExpireAt().isAfter(LocalDateTime.now())) {
            memberLevel = member.getLevel() != null ? member.getLevel() : 0;
        }

        return buildUserVO(user, memberLevel);
    }

    @Override
    @Transactional
    public UserVO updateProfile(String uid, UpdateProfileDTO dto) {
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 检查昵称唯一性
        if (dto.getNickname() != null && !dto.getNickname().isEmpty()) {
            userRepository.findByNicknameAndDeletedAtIsNull(dto.getNickname())
                    .ifPresent(existing -> {
                        if (!existing.getUid().equals(uid)) {
                            throw new BusinessException("昵称已被使用");
                        }
                    });
            user.setNickname(dto.getNickname());
        }

        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }
        if (dto.getGender() != null) {
            user.setGender(dto.getGender());
        }
        if (dto.getBirthday() != null && !dto.getBirthday().isEmpty()) {
            user.setBirthday(LocalDate.parse(dto.getBirthday()));
        }
        if (dto.getSignature() != null) {
            user.setSignature(dto.getSignature());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 获取会员级别
        Member member = memberRepository.findByUid(uid).orElse(null);
        int memberLevel = 0;
        if (member != null && member.getExpireAt() != null && member.getExpireAt().isAfter(LocalDateTime.now())) {
            memberLevel = member.getLevel() != null ? member.getLevel() : 0;
        }

        return buildUserVO(user, memberLevel);
    }

    @Override
    public PageResult<SongVO> getFavorites(String uid, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);

        // 查询收藏的歌曲
        Page<Collection> collections = collectionRepository
                .findByUidAndTargetTypeOrderByCreatedAtDesc(uid, "song", pageable);

        List<SongVO> songVOList = collections.getContent().stream()
                .map(col -> {
                    Song song = songRepository.findBySongId(col.getTargetId()).orElse(null);
                    if (song == null || song.getStatus() != 1) {
                        return null;
                    }
                    return buildSongVO(song);
                })
                .filter(vo -> vo != null)
                .collect(Collectors.toList());

        return PageResult.of(songVOList, collections.getTotalElements(), page, size);
    }

    @Override
    @Transactional
    public void addFavorite(String uid, String songId) {
        // 检查歌曲是否存在
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        // 检查是否已收藏
        collectionRepository.findByUidAndTargetTypeAndTargetId(uid, "song", songId)
                .ifPresent(c -> {
                    throw new BusinessException("已收藏该歌曲");
                });

        // 检查收藏上限
        long count = collectionRepository.countByUidAndTargetType(uid, "song");
        if (count >= MAX_FAVORITES) {
            throw new BusinessException("收藏数量已达上限（" + MAX_FAVORITES + "）");
        }

        Collection collection = new Collection();
        collection.setUid(uid);
        collection.setTargetType("song");
        collection.setTargetId(songId);
        collection.setCreatedAt(LocalDateTime.now());
        collectionRepository.save(collection);
    }

    @Override
    @Transactional
    public void removeFavorite(String uid, String songId) {
        Collection collection = collectionRepository.findByUidAndTargetTypeAndTargetId(uid, "song", songId)
                .orElseThrow(() -> new BusinessException("未收藏该歌曲"));
        collectionRepository.delete(collection);
    }

    private UserVO buildUserVO(User user, int memberLevel) {
        UserVO vo = new UserVO();
        vo.setUid(user.getUid());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setGender(user.getGender());
        vo.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
        vo.setSignature(user.getSignature());
        vo.setPhone(user.getPhone() != null ? maskPhone(user.getPhone()) : null);
        vo.setMemberLevel(memberLevel);
        return vo;
    }

    private SongVO buildSongVO(Song song) {
        SongVO vo = new SongVO();
        vo.setSongId(song.getSongId());
        vo.setName(song.getName());
        vo.setDuration(song.getDuration());
        vo.setIsVip(song.getIsVip());
        vo.setPlayCount(song.getPlayCount());

        // 获取歌手信息
        List<SongArtist> songArtists = songArtistRepository.findBySongId(song.getId());
        List<String> artistNames = new ArrayList<>();
        List<String> artistIds = new ArrayList<>();
        for (SongArtist sa : songArtists) {
            artistRepository.findById(sa.getArtistId()).ifPresent(artist -> {
                artistNames.add(artist.getName());
                artistIds.add(artist.getArtistId());
            });
        }
        vo.setArtistNames(artistNames);
        vo.setArtistIds(artistIds);

        return vo;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}
