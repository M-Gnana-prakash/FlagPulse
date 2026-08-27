package com.example.FlagPulse.model;

import com.example.FlagPulse.enums.RuleOperator;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "targeting_rules")
public class TargetingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Attribute name is required")
    @Size(max = 100, message = "Attribute name must not exceed 100 characters")
    @Column(name = "attribute_name", nullable = false, length = 100)
    private String attributeName;

    @NotNull(message = "Operator is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "operator", nullable = false)
    private RuleOperator operator;

    @NotBlank(message = "Target value is required")
    @Size(max = 255, message = "Target value must not exceed 255 characters")
    @Column(name = "target_value", nullable = false, length = 255)
    private String targetValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flag_id", nullable = false)
    @JsonBackReference
    private FeatureFlag featureFlag;
}