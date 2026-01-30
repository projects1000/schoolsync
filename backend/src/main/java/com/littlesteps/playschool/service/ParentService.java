package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<ParentDTO> getAllParents() {
        return parentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ParentDTO getParentById(String id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        return convertToDTO(parent);
    }

    public ParentDTO createParent(ParentDTO parentDTO) {
        if (parentRepository.existsByEmail(parentDTO.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Parent parent = new Parent();
        parent.setName(parentDTO.getName());
        parent.setEmail(parentDTO.getEmail());
        parent.setPhoneNumber(parentDTO.getPhoneNumber());
        parent.setAddress(parentDTO.getAddress());
        parent.setOccupation(parentDTO.getOccupation());
        if (parentDTO.getRelation() != null) {
            parent.setRelation(Parent.RelationType.valueOf(parentDTO.getRelation().toUpperCase()));
        }
        parent.setStatus(Parent.Status.ACTIVE);
        parent.setCreatedAt(LocalDateTime.now());

        Parent savedParent = parentRepository.save(parent);
        return convertToDTO(savedParent);
    }

    public ParentDTO updateParent(String id, ParentDTO parentDTO) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        parent.setName(parentDTO.getName());
        parent.setPhoneNumber(parentDTO.getPhoneNumber());
        parent.setAddress(parentDTO.getAddress());
        parent.setOccupation(parentDTO.getOccupation());
        if (parentDTO.getRelation() != null) {
            parent.setRelation(Parent.RelationType.valueOf(parentDTO.getRelation().toUpperCase()));
        }
        parent.setUpdatedAt(LocalDateTime.now());

        Parent savedParent = parentRepository.save(parent);
        return convertToDTO(savedParent);
    }

    public void mapStudentToParent(String parentId, String studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Prevent duplicate mapping
        boolean alreadyMapped = parent.getChildren().stream()
                .anyMatch(s -> s.getId().equals(studentId));

        if (alreadyMapped) {
            throw new RuntimeException("Student already mapped to this parent");
        }

        parent.addChild(student);
        parentRepository.save(parent);
        studentRepository.save(student); // Save student with updated guardian info
    }

    public void unmapStudentFromParent(String parentId, String studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        parent.removeChild(student);
        parentRepository.save(parent);
        studentRepository.save(student);
    }

    private ParentDTO convertToDTO(Parent parent) {
        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
        dto.setName(parent.getName());
        dto.setEmail(parent.getEmail());
        dto.setPhoneNumber(parent.getPhoneNumber());
        dto.setAddress(parent.getAddress());
        dto.setOccupation(parent.getOccupation());
        dto.setRelation(parent.getRelation() != null ? parent.getRelation().name() : null);
        dto.setStatus(parent.getStatus() != null ? parent.getStatus().name() : null);
        dto.setChildrenCount(parent.getChildren() != null ? parent.getChildren().size() : 0);
        return dto;
    }
}
