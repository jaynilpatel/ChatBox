package sample;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;




/*
class JsonEncodeDemo {

    public static void main(String[] args){

        JSONObject obj = new JSONObject();

        obj.put("name","foo");
        obj.put("num",new Integer(100));
        obj.put("balance",new Double(1000.21));
        obj.put("is_vip",new Boolean(true));

        StringWriter out = new StringWriter();
        obj.writeJSONString(out);

        String jsonText = out.toString();
        System.out.print(jsonText);
    }
}
*/
public class NodeJsServer {

    Socket socket = null;

    public void socketConnect(String ip, int port) throws IOException {
        System.out.println("[Connecting to socket...]");
        this.socket = new Socket(ip, port);
    }

    public String echo(String message){

        try {

            PrintWriter out = new PrintWriter(getSocket().getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(getSocket().getInputStream()));
            out.println(message);
            String returnStr = in.readLine();
            return returnStr;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Socket getSocket() {
        return socket;
    }
}