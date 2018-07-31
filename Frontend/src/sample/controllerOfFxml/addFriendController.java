package sample.controllerOfFxml;

import javafx.fxml.FXML;

import javafx.fxml.Initializable;

import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

import java.net.URL;
import java.util.ResourceBundle;



public class addFriendController implements Initializable{
    @FXML
    private WebView webView;

    String user = chatRoomController.user;
    private WebEngine engine = new WebEngine();

    @Override
    public void initialize(URL url, ResourceBundle rb){
        engine = webView.getEngine();
        engine.load("http://localhost:4000/searchUser.html?user="+ user);
    }
}
