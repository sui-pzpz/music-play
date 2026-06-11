package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.common.PageResult;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.entity.*;
import com.xx.music.model.vo.AdminUserListVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.model.vo.UserVO;
import com.xx.music.repository.*;
import com.xx.music.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final CollectionRepository collectionRepository;
    private final SongRepository songRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;

    @Override
    public AdminUserListVO getUsers(int page, int size, String keyword, Integer status,
                                    String startDate, String endDate) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (keyword != null && !keyword.isEmpty()) {
                Predicate phoneLike = cb.like(root.get("phone"), "%" + keyword + "%");
                Predicate nicknameLike = cb.like(root.get("nickname"), "%" + keyword + "%");
                Predicate uidLike = cb.like(root.get("uid"), "%" + keyword + "%");
                predicates.add(cb.or(phoneLike, nicknameLike, uidLike));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDate != null && !startDate.isEmpty()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        LocalDate.parse(startDate).atStartOfDay()));
            }
            if (endDate != null && !endDate.isEmpty()) {
                predicates.add(cb.lessThan(root.get("createdAt"),
                        LocalDate.parse(endDate).atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<UserVO> userVOList = userPage.getContent().stream()
                .map(user -> {
                    UserVO vo = new UserVO();
                    vo.setUid(user.getUid());
                    vo.setNickname(user.getNickname());
                    vo.setAvatar(user.getAvatar());
                    vo.setPhone(user.getPhone());
                    vo.setGender(user.getGender());
                    vo.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
                    vo.setSignature(user.getSignature());
                    vo.setStatus(user.getStatus());
                    vo.setCreatedAt(user.getCreatedAt());
                    return vo;
                })
                .collect(Collectors.toList());

        AdminUserListVO vo = new AdminUserListVO();
        vo.setList(userVOList);
        vo.setTotal(userPage.getTotalElements());
        vo.setPage(page);
        vo.setSize(size);
        return vo;
    }

    @Override
    public UserVO getUserDetail(String uid) {
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        Member member = memberRepository.findByUid(uid).orElse(null);
        int memberLevel = 0;
        if (member != null && member.getExpireAt() != null && member.getExpireAt().isAfter(LocalDateTime.now())) {
            memberLevel = member.getLevel() != null ? member.getLevel() : 0;
        }

        UserVO vo = new UserVO();
        vo.setUid(user.getUid());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setPhone(user.getPhone());
        vo.setGender(user.getGender());
        vo.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
        vo.setSignature(user.getSignature());
        vo.setStatus(user.getStatus());
        vo.setMemberLevel(memberLevel);
        vo.setCreatedAt(user.getCreatedAt());
        vo.setLastLoginAt(user.getLastLoginAt());
        vo.setLastLoginIp(user.getLastLoginIp());
        return vo;
    }

    @Override
    @Transactional
    public void updateUserStatus(String uid, UpdateStatusDTO dto, Long adminId) {
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setStatus(dto.getStatus());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(String uid, Long adminId) {
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setDeletedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public PageResult<PlayHistory> getUserHistory(String uid, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PlayHistory> historyPage = playHistoryRepository.findByUidOrderByPlayedAtDesc(uid, pageable);
        return PageResult.of(historyPage.getContent(), historyPage.getTotalElements(), page, size);
    }

    @Override
    public PageResult<SongVO> getUserFavorites(String uid, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Collection> collections = collectionRepository
                .findByUidAndTargetTypeOrderByCreatedAtDesc(uid, "song", pageable);

        List<SongVO> songVOList = collections.getContent().stream()
                .map(col -> {
                    Song song = songRepository.findBySongId(col.getTargetId()).orElse(null);
                    if (song == null) return null;

                    SongVO vo = new SongVO();
                    vo.setSongId(song.getSongId());
                    vo.setName(song.getName());
                    vo.setDuration(song.getDuration());
                    vo.setIsVip(song.getIsVip());
                    vo.setPlayCount(song.getPlayCount());

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
                })
                .filter(vo -> vo != null)
                .collect(Collectors.toList());

        return PageResult.of(songVOList, collections.getTotalElements(), page, size);
    }
}
