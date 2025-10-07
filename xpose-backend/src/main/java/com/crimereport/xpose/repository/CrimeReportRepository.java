package com.crimereport.xpose.repository;

import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.models.CrimeReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CrimeReportRepository extends JpaRepository<CrimeReport, String> {

    @Query("SELECT new com.crimereport.xpose.dto.CrimeReportList(" +
            "cr.id, ct.name, cr.crimeTypeId, cr.crimeCategoryId, cc.name, " +
            "cr.originalDescription, cr.translatedDescription, cr.address, " +
            "cr.city, cr.state, cr.policeStation, cr.status, cr.urgencyLevel, " +
            "cr.submittedAt, CASE WHEN cr.assignedOfficerId IS NOT NULL THEN cr.assignedOfficerId.id ELSE NULL END, " +
            "cr.reviewStatus) " +
            "FROM CrimeReport cr " +
            "LEFT JOIN CrimeType ct ON ct.id = cr.crimeTypeId " +
            "LEFT JOIN CrimeCategory cc ON cc.id = cr.crimeCategoryId " +
            "ORDER BY cr.submittedAt DESC")
    Page<CrimeReportList> findAllReportsForList(Pageable pageable);

    @Query("SELECT cr FROM CrimeReport cr WHERE cr.id = ?1")
    Optional<CrimeReport> findDetailedReportById(String reportId);

    @Query("SELECT cr.id FROM CrimeReport cr WHERE cr.id = ?1")
    Optional<String> findReportId(String reportId);

    @Query("SELECT cr FROM CrimeReport cr LEFT JOIN FETCH cr.assignedOfficerId a WHERE cr.id = ?1")
    Optional<CrimeReport> findReportWithOfficer(String reportId);
}