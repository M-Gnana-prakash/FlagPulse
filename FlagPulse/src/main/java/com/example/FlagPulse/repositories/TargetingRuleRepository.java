package com.example.FlagPulse.repositories;

import com.example.FlagPulse.model.TargetingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TargetingRuleRepository extends JpaRepository<TargetingRule, Long> {
}
