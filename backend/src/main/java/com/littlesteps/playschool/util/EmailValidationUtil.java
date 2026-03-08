package com.littlesteps.playschool.util;

import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.regex.Pattern;

public class EmailValidationUtil {

    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    /**
     * Validates an email address.
     * 1. Checks standard regex format.
     * 2. Rejects common test/dummy email prefixes.
     * 3. Performs a DNS MX record lookup on the domain to ensure it can receive mail.
     *
     * @param email The email address to validate.
     * @return true if valid and domain has MX records, false otherwise.
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        email = email.trim().toLowerCase();

        // 1. Basic format check
        if (!pattern.matcher(email).matches()) {
            return false;
        }

        // 2. Reject obvious test/dummy emails
        if (email.startsWith("test@") || 
            email.startsWith("dummy@") || 
            email.startsWith("fake@") || 
            email.startsWith("example@")) {
            return false;
        }

        // Extract domain
        String domain = email.substring(email.indexOf("@") + 1);

        // 3. DNS MX Record Lookup
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            return attr != null && attr.size() > 0;
        } catch (Exception e) {
            // DNS lookup failed or domain has no MX records
            return false;
        }
    }
}
