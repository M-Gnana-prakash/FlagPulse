package com.example.FlagPulse.controller;

import com.example.FlagPulse.dto.EvaluationRequest;
import com.example.FlagPulse.model.FeatureFlag;
import com.example.FlagPulse.service.FlagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/flags")
@CrossOrigin (origins = "*")
public class FlagController {
    private final FlagService flagService;

    public FlagController(FlagService flagService) {
        this.flagService = flagService;
    }

    @GetMapping
    public ResponseEntity<List<FeatureFlag>> getAllFlags() {
        List<FeatureFlag> flags = flagService.getAllFlags();
        return ResponseEntity.ok(flags);
    }

    @PostMapping
    public ResponseEntity<FeatureFlag> createFlag (@RequestBody FeatureFlag flag) {
        FeatureFlag createdFlag = flagService.createFlag(flag);
        return ResponseEntity.ok(createdFlag);
    }

    @PostMapping("/{flagKey}/toggle")
    public ResponseEntity<FeatureFlag> toggleFlag (@PathVariable String flagKey, boolean enabled) {
        FeatureFlag toggledFlag = flagService.toggleFlag(flagKey, enabled);
        return ResponseEntity.ok(toggledFlag);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateFlag(@RequestBody EvaluationRequest request) {
        long startTime = System.nanoTime();
        boolean result = flagService.evaluateFlag(request.getFlagKey(), request.getContext());
        double executionTimeMs = (System.nanoTime() - startTime) / 1_000_000.0;

        return ResponseEntity.ok(Map.of(
                "flagKey", request.getFlagKey(),
                "enabled", result,
                "executionTimeMs", executionTimeMs
        ));
    }
}
