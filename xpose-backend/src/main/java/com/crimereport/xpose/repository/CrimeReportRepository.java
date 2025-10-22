package com.crimereport.xpose.repository;

import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.models.CrimeReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CrimeReportRepository extends JpaRepository<CrimeReport, String> {

    @Query("""
    SELECT new com.crimereport.xpose.dto.CrimeReportList(
        cr.id, ct.name, cr.crimeTypeId, cr.crimeCategoryId, cc.name,
        cr.originalDescription, cr.translatedDescription,
        cr.address, cr.city, cr.state, cr.policeStation,
        cr.status, cr.urgencyLevel, cr.submittedAt,
        ao.id,
        ao.name,
        cr.adminStatus,
        cr.policeStatus  
    )
    FROM CrimeReport cr
    LEFT JOIN CrimeType ct ON ct.id = cr.crimeTypeId
    LEFT JOIN CrimeCategory cc ON cc.id = cr.crimeCategoryId
    LEFT JOIN cr.assignedOfficerId ao
    LEFT JOIN PoliceStation ps ON ps.name = cr.policeStation
    WHERE (
        :officerId IS NOT NULL AND ao.id = :officerId
    ) OR (
        :officerId IS NULL AND (:stationId IS NULL OR ps.id = :stationId)
    )
    ORDER BY cr.submittedAt DESC
    """)
    Page<CrimeReportList> findAllReportsForList(
            Pageable pageable,
            @Param("stationId") Long stationId,
            @Param("officerId") Long officerId
    );

    @Query("SELECT cr FROM CrimeReport cr LEFT JOIN FETCH cr.assignedOfficerId WHERE cr.id = ?1")
    Optional<CrimeReport> findDetailedReportById(String reportId);

    @Query("SELECT cr.id FROM CrimeReport cr WHERE cr.id = ?1")
    Optional<String> findReportId(String reportId);

    @Query("SELECT cr FROM CrimeReport cr LEFT JOIN FETCH cr.assignedOfficerId a WHERE cr.id = ?1")
    Optional<CrimeReport> findReportWithOfficer(String reportId);

    boolean existsById(String id);

    @Query("SELECT COUNT(cr) > 0 FROM CrimeReport cr WHERE cr.id = :id")
    boolean existsByReportId(@Param("id") String id);
}