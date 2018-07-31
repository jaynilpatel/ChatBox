package sample.controllerOfFxml;

import com.jfoenix.controls.JFXButton;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import org.json.simple.JSONObject;
import sample.Main;
import sample.NodeJsServer;

import java.awt.event.ActionEvent;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.ResourceBundle;

public class chatRoomController implements Initializable {
    @FXML
    private WebView webViewPersonal;
    private WebEngine enginePersonal = new WebEngine();
    @FXML
    private WebView webViewGroup;
    private WebEngine engineGroup = new WebEngine();
    @FXML
    private  WebView webViewPrivate;
    private WebEngine enginePrivate = new WebEngine();

    public static String user;


    public void onAddFriend() throws IOException{
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("../fxml/addFriend.fxml"));
        Parent root1 = (Parent)fxmlLoader.load();
        Stage stage = new Stage();
        stage.setTitle("Add Friend");
        stage.setScene(new Scene(root1));
        stage.show();
    }

    /*
    public void onLogOut() throws IOException{
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("../fxml/logOut.fxml"));
        Parent root1 = (Parent)fxmlLoader.load();
        Stage logoutStage;
        logoutStage = new Stage();
        logoutStage.setTitle("Log Out");
        logoutStage.setScene(new Scene(root1));
        logoutStage.show();
    }
    */

    public void onFriendRequests() throws IOException{
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("../fxml/friendRequests.fxml"));
        Parent root1 = (Parent)fxmlLoader.load();
        Stage stage = new Stage();
        stage.setTitle("Friend Requests");
        stage.setScene(new Scene(root1));
        stage.show();
    }


    public String jsonToString(String uname){

        JSONObject obj = new JSONObject();

        obj.put("uname", uname);


        StringWriter out = new StringWriter();
        try {
            obj.writeJSONString(out);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(obj);
        String jsonText = out.toString();

        return jsonText;
    }

    public String logoutRequest,responseStatus;


    @FXML
    private JFXButton logOut;
    public void onLogout() throws Exception{
        Stage stage = (Stage) logOut.getScene().getWindow();
        stage.close();
        logoutRequest = jsonToString(user);

        NodeJsServer client =new NodeJsServer();
        String ip = "localhost";
        int port = 6998;
        client.socketConnect(ip, port);

        System.out.println("Sending Username: " + logoutRequest);
        responseStatus = client.echo(logoutRequest);
        System.out.println("Received response: " + responseStatus );

        Main.root = FXMLLoader.load(getClass().getResource("../fxml/sample.fxml"));
        Main.window.setScene(new Scene(Main.root, 800,550));
        Main.window.show();

    }




    public void initData(String uname){
        user = uname;
        enginePersonal.load("http://localhost:4000/contactList.html?user="+uname);
        engineGroup.load("http://localhost:4000/group.html?user="+uname);
        enginePrivate.load("http://localhost:4000/privateContactList.html?user="+uname);

    }

    public void sendMessage(){
    }
    @Override
    public void initialize(URL url, ResourceBundle rb){
        enginePersonal = webViewPersonal.getEngine();
        engineGroup = webViewGroup.getEngine();
        enginePrivate = webViewPrivate.getEngine();
    }
}
