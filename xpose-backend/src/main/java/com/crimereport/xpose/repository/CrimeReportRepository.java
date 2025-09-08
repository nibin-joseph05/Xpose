package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.CrimeReport;
import com.crimereport.xpose.models.CrimeReport.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CrimeReportRepository extends JpaRepository<CrimeReport, UUID> {

    List<CrimeReport> findByIsSpam(Boolean isSpam);

    List<CrimeReport> findByNeedsReview(Boolean needsReview);

    List<CrimeReport> findByStatus(ReportStatus status);

    List<CrimeReport> findByCrimeCategoryId(UUID crimeCategoryId);

    List<CrimeReport> findByUrgencyLevel(CrimeReport.UrgencyLevel urgencyLevel);

    List<CrimeReport> findBySpamScoreGreaterThan(Double threshold);
}
