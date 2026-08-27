package com.example.FlagPulse.service;

import com.example.FlagPulse.model.FeatureFlag;
import com.example.FlagPulse.model.TargetingRule;
import com.example.FlagPulse.repositories.FeatureFlagRepository;
import com.example.FlagPulse.repositories.TargetingRuleRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class FlagService {

    private final FeatureFlagRepository featureFlagRepository;
    private final CacheManager cacheManager;
    private final SimpMessagingTemplate template;

    public FlagService(FeatureFlagRepository featureFlagRepository, CacheManager cacheManager, SimpMessagingTemplate template) {
        this.featureFlagRepository = featureFlagRepository;
        this.cacheManager = cacheManager;
        this.template = template;
    }

    public List<FeatureFlag> getAllFlags() {
        return featureFlagRepository.findAll();
    }

    @Transactional
    public FeatureFlag createFlag(FeatureFlag flag) {
        for (TargetingRule rule : flag.getRules()) {
            rule.setFeatureFlag(flag);
        }
        return featureFlagRepository.save(flag);
    }

    @Transactional
    public FeatureFlag toggleFlag(String flagKey, boolean enabled) {
        FeatureFlag flag = featureFlagRepository.findByFlagKey(flagKey)
                .orElseThrow(() -> new IllegalArgumentException("Flag not found: " + flagKey));

        flag.setEnabled(enabled);
        FeatureFlag updated = featureFlagRepository.save(flag);

        Objects.requireNonNull(cacheManager.getCache("flag-evaluations")).clear();

        template.convertAndSend(
                "/topic/flag-updates",
                (Object) Map.of(
                        "action", "TOGGLE",
                        "flagKey", flagKey,
                        "enabled", enabled
                )
        );

        return updated;
    }

    @Cacheable(value = "flag-evaluations", key = "#flagKey + ':' + #context.toString()")
    public boolean evaluateFlag(String flagKey, Map<String, Object> context) {
        FeatureFlag flag = featureFlagRepository.findByFlagKey(flagKey).orElse(null);

        if (flag == null || !flag.isEnabled()) {
            return false;
        }

        if (flag.getRules().isEmpty()) {
            return true;
        }

        return flag.getRules().stream().allMatch(rule -> evaluateRule(rule, context));
    }

    private boolean evaluateRule(TargetingRule rule, Map<String, Object> context) {
        Object attrValue = context.get(rule.getAttributeName());

        return switch (rule.getOperator()) {
            case EQUALS -> attrValue != null && attrValue.toString().equalsIgnoreCase(rule.getTargetValue());
            case GREATER_THAN -> {
                if (attrValue == null) yield false;
                try {
                    yield Double.parseDouble(attrValue.toString()) > Double.parseDouble(rule.getTargetValue());
                } catch (NumberFormatException e) {
                    yield false;
                }
            }
            case PERCENTAGE -> {
                String userId = context.getOrDefault("userId", "").toString();
                if (userId.isEmpty()) yield false;
                int hash = Math.abs((userId + rule.getFeatureFlag().getFlagKey()).hashCode()) % 100;
                try {
                    yield hash < Integer.parseInt(rule.getTargetValue());
                } catch (NumberFormatException e) {
                    yield false;
                }
            }
        };
    }
}
