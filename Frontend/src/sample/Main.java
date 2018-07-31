package sample;


import javafx.application.Application;
import javafx.fxml.Initializable;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.net.URL;
import java.util.ResourceBundle;


public class Main extends Application implements Initializable{

    public static Stage window;
    public static Parent root;

    @Override
    public void start(Stage primaryStage) throws Exception{
        window = primaryStage;
        root = FXMLLoader.load(getClass().getResource("fxml/sample.fxml"));
        window.setScene(new Scene(this.root, 800, 550));
        window.show();
    }


    //************Welcome***********//
    public  void openWelcome() throws  Exception{
        root = FXMLLoader.load(getClass().getResource("fxml/sample.fxml"));
        window.setScene(new Scene(root, 800,550));
        window.show();
    }

    //************LOGIN*************//
    public  void openLogin() throws Exception{
        root = FXMLLoader.load(getClass().getResource("fxml/loginForm.fxml"));
        window.setScene(new Scene(root, 800,550));
        window.show();
    }


    //************REGISTER************//
    public void openRegister() throws Exception{
        root = FXMLLoader.load(getClass().getResource("fxml/registerForm.fxml"));
        window.setScene(new Scene(root, 800,550));
        window.show();
    }

    public void onBack() throws Exception{
        openWelcome();
    }

    @Override
    public void initialize(URL url, ResourceBundle rb){
    }

    public static void main(String[] args) {
        launch(args);
    }
}
