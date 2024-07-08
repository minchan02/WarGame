package com.example.log4jdemo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;

@Controller
public class HomeController {

    Logger log = LogManager.getLogger(HomeController.class);

    @GetMapping("/")
    public String index(@RequestParam(name = "name", required = false) String name, Model model) {

        if (name != null) {
            if (isAllowedName(name)) {
                ThreadContext.put("myContext", name);
                log.info("User input: {}", name);
                model.addAttribute("logName", "hi " + name);
                ThreadContext.remove("myContext");
            }
            else{
                model.addAttribute("logName", "Filtered!");
            }
        }

        return "index.html";
    }

    private boolean isAllowedName(String name) {
        List<String> FILTER_STRINGS = Arrays.asList("jndi", "ldap", "-", "lower", "upper");

        String lowerCaseName = name.toLowerCase();
        for (String filterString : FILTER_STRINGS) {
            if (lowerCaseName.contains(filterString)) {
                return false;
            }
        }
        return true;
    }
}
