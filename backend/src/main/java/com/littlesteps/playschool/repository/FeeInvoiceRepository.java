package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.FeeInvoice;
import com.littlesteps.playschool.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeInvoiceRepository extends MongoRepository<FeeInvoice, String> {

    List<FeeInvoice> findBySchoolId(String schoolId);

    Optional<FeeInvoice> findByInvoiceNo(String invoiceNo);

    List<FeeInvoice> findByStudent(Student student);

    List<FeeInvoice> findByStatus(FeeInvoice.Status status);

    @Query("{ 'dueDate': { '$lt': ?0 } }")
    List<FeeInvoice> findByDueDateBefore(LocalDate date);

    @Query("{ 'student.className': ?0 }")
    List<FeeInvoice> findByStudentClass(String className);

    @Query("{ '$or': [ { 'status': 'OVERDUE' }, { 'status': 'PENDING', 'dueDate': { '$lt': ?0 } } ] }")
    List<FeeInvoice> findOverdueInvoices(LocalDate currentDate);

    boolean existsByInvoiceNo(String invoiceNo);

    List<FeeInvoice> findBySchoolIdAndStatus(String schoolId, FeeInvoice.Status status);
}