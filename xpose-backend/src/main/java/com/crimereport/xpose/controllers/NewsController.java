package com.crimereport.xpose.controllers;

import com.crimereport.xpose.services.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping("/kerala-crime")
    public ResponseEntity<?> getKeralaCrimeNews() {
        String news = newsService.getKeralaCrimeNews();
        return ResponseEntity.ok(news);
    }
}
