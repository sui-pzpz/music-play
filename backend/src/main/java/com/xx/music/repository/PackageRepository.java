package com.xx.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<com.xx.music.model.entity.Package, Long> {

    Optional<com.xx.music.model.entity.Package> findByPackageId(String packageId);

    List<com.xx.music.model.entity.Package> findByStatusOrderBySortOrderAsc(Integer status);
}
