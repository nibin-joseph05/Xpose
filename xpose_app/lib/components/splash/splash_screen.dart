class Box {
    int width;
    int height;
}

public class Main {
    public static void main(String[] args) {
        Box b = new Box(); // Create object
        b.width = 10;      // Access instance variables
        b.height = 20;

        System.out.println("Width: " + b.width);
        System.out.println("Height: " + b.height);
    }
}
