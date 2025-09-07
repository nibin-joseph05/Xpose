package com.crimereport.xpose.util;

import java.security.SecureRandom;

public class TrackingIdGenerator {

    private static final String PREFIX = "Xpose";
    private static final char SEP = '-';
    private static final char[] ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final int ALPHABET_LEN = ALPHABET.length;
    private static final SecureRandom RNG = new SecureRandom();

    public static String newTrackingId() {
        char[] core = new char[16];
        for (int i = 0; i < core.length; i++) {
            core[i] = ALPHABET[RNG.nextInt(ALPHABET_LEN)];
        }
        char checksum = checksum(core);

        return PREFIX + SEP
                + new String(core, 0, 4) + SEP
                + new String(core, 4, 4) + SEP
                + new String(core, 8, 4) + SEP
                + new String(core, 12, 4) + SEP
                + checksum;
    }

    public static String newRejectedId() {
        char[] core = new char[12];
        for (int i = 0; i < core.length; i++) {
            core[i] = ALPHABET[RNG.nextInt(ALPHABET_LEN)];
        }
        char checksum = checksum(core);

        return PREFIX + SEP + "RJCT" + SEP
                + new String(core, 0, 4) + SEP
                + new String(core, 4, 4) + SEP
                + new String(core, 8, 4) + SEP
                + checksum;
    }

    private static char checksum(char[] core) {
        int sum = 0;
        for (char c : core) {
            for (int i = 0; i < ALPHABET_LEN; i++) {
                if (ALPHABET[i] == c) {
                    sum += i;
                    break;
                }
            }
        }
        return ALPHABET[sum % ALPHABET_LEN];
    }
}
