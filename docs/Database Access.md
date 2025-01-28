# Database Access

The Postgres database is hosted via AWS RDS but is not publicly accessible.
If you require access, you will need to connect via the AWS Bastion Host.

## Obtaining Access

You will need a tool to create an SSH Key Pair. If you are using Windows, you can use PuTTYgen. If you are using Linux or MacOS, you can use the `ssh-keygen` command.
You should ensure you set a strong passphrase. Once you have created your key pair, you will need to provide the public key to a project admin who already has access.
You must keep your private key secure and not share it with anyone.

## Connecting to the Bastion Host

Once your public key has been to the Bastion Host, you can test your connection by running the following command:

```bash
ssh -i /path/to/your/private/key <hostname>
```

The hostname will be provided to you by a project admin.

## SSH Tunneling with Datagrip

To connect to the database using Datagrip, you will need to create an SSH tunnel. You can do this by following the steps below:

1. Create a Postgres database source with the AWS RDS endpoint, username, and password as standard.
2. In the SSH/SSL tab, select the 'Use SSH tunnel' checkbox.
3. Click the button next to "SSH configuration" and add a new SSH configuration.
4. Enter the following details:
    - Host: The hostname of the Bastion Host
    - Port: 22
    - User: The username provided to you by a project admin
    - Auth type: Key pair (OpenSSH or PuTTY)
    - Private key file: The path to your private key
    - Passphrase: The passphrase you set when creating the key pair
5. Click 'Test Connection' to ensure the SSH tunnel is working.
6. Click 'OK' to save the SSH configuration.
