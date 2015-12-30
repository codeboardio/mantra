# Mantra
Web service for compiling and running programs. Part of the codeboard.io project.

## Requirements

Mantra requires NodeJS and Docker.

* Nodejs: tested with version 0.12.9
* Docker: tested with version 1.8.1 ([installation instructions here](https://docs.docker.com/engine/installation/ubuntulinux))
* Mantra has been tested on an Ubuntu 14.04 system.


## Preparations

### Preparing an Ubuntu system
When running Mantra in production, it assumes that user of name "cobo" exits. The user must have a specific user id and be part of a group with a specific id. The following assumes a "fresh" Linux system and we'll add the user and group we need.

```
# add a group with name "cobo" and group id 2506
groupadd --gid 2506 cobo

# add a user "cobo" with user id 2506, the default group with gid 2506
# make sure the user is also in group "sudo" (this allows e.g. for ssh access for "cobo")
# create and set the home directory to /home/cobo  
useradd --uid 2506 --gid 2506 -G sudo -m -d /home/cobo -c "Codeboard user" cobo

# set the password for user cobo
passwd cobo

# set the default shell for user cobo to bash
chsh -s /bin/bash cobo

# add the cobo user to docker group (so it can run the docker cli)
usermod -a -G docker cobo

# create folders where we store Mantra and the temporary files Mantra will create
mkdir -p /var/www
mkdir -p /tmp/projects

# make cobo the owner of the relevant folders for Mantra
chown -R cobo:cobo /var/www
chown -R cobo:cobo /tmp/projects

# reboot the machine
shutdown -r now

# login as user cobo and continue the next preparation steps
```

### Preparing Docker Remote API on Ubuntu
Configure the Docker Remote API by editing the Docker conf file.

```
sudo vi /etc/default/docker
```

Replace the existing, commented DOCKER_OPTS line with the following:

```
DOCKER_OPTS='-H tcp://127.0.0.1:4243 -H unix:///var/run/docker.sock'
```

**Important**: the IP address should be ```127.0.0.1``` and *not* ```0.0.0.0```. If we use ```127.0.0.1``` only the server itself can talk to the Remote API. Using ```0.0.0.0``` would open the port for anyone to use (who knows the IP of the server).

Restart the docker service (maybe need to reboot):
```
service docker restart
```

### Building all Docker Images
Create a folder to clone the Codeboard Repository that contains all the Docker Build files we need.
Run the folllowing:

```
cd /var/www
mkdir codeboard_docker
git clone https://github.com/codeboardio/codeboard_docker.git codeboard_docker
```

Change into the codeboard_docker folder and run the script
```
.build_all_docker.sh
```

Once the script is done, we can check that the Docker images are available.
```
# should give a list of docker images, e.g. cobo/ubuntu, cobo/gcc etc.
docker images
```

### Security - Preventing Fork-Bombs

We limit the number of processes the user *cobo* can create (for this reason, always run Mantra as user *cobo* and not as root).

#### Server configuration
First, we modifiy the settings of our sever which runs Mantra. 

```
sudo vi /etc/security/limits.conf
```

Add the following lines:

```
# limit number of processes user cobo can start
cobo            soft    nproc           1792
cobo            hard    nproc           2048
```

The above limitation is useful, because it will protect the server from "accidental" fork bombs or misconfigurations that might lead to fork bombs.

**Important**: the settings in ```/etc/security/limits.conf``` is ignored by the Docker containers we create (even though we use the user *cobo* inside the container. Thus, it is crucial to set an nproc limit for Docker separately.


#### Docker container configuration
With more recent versions of Docker, we can also set Ulimits at the creation time of a container. Mantra uses this feature in ```server/docker/docker.js``` and sets an nproc limit (max number of processes). By default, Mantra will set a soft limit of 1024 processes and a hard limit of 1536 processes. If those values are fine for you, you don't need to change anything. But keep in mind: the limits are shared among all containers that run simultationsly. So don't make the limits to small.

```
// in server/docker/docker.js: function createContainer
  HostConfig: {
    Binds: [aWorkingDir + ':' + aWorkingDir],
    Ulimits: [{Name: 'nproc', Soft: 1024, Hard: 1536}]
  }
```

#### Removing containers with too many processes

Mantra has a monitoring function that can check all active Docker containers for the number of processes they run. If a container runs too many processes, Mantra will terminate that container (unfortuanetly without sending a message about that to the user).

By default, the monitor is disabled. To enable it, set the environment variable:

```
MONITOR_MAX_NPROC=true // default is false
MONITOR_MAX_NPROC_INTERVAL=15 // check every x seconds, default is 15
MONITOR_MAX_NPROC_LIMIT=100 // max. number of processes per container, default is 100
```

**Important**: if you're running multiple instances of Mantra on the same server, only one instance should perform any monitoring activities. In general, monitoring creates little overhead. The bottleneck is actually the Docker deamon which e.g. does container removal in a non-concurrent, blocking manner. 

## Installing Mantra

Clone the Mantra repository into /var/www
```
cd /var/www
git clone https://github.com/codeboardio/mantra.git
```
Install all of Mantra's dependencies
```
# change into the folder were you've clone Mantra
cd mantra
npm install
```

## Running and Testing Mantra

To run Mantra (tests use settings file config/env/production.js):
```
npm run-script deploy
```

To test Mantra (tests use settings file config/env/test.js):
```
npm run-script test
```

To test Mantra using the Docker images (tests use settings file config/env/test.js):
```
npm run-script testFunctional
```

## Mantra CRON jobs
Mantra provides two bash scripts in the ```scripts``` folder which are intended to be used as CRON jobs.
To configure the jobs on the server do the following:

```
# assuming the Mantra repo is in /var/www/mantra
cp /var/www/mantra/scripts/mantra_cron_rm_* /var/www/cron
```

Next configure the CRON jobs by running ``` crontab -e```, delete the template and add the following:

```
#-----------------------------------------------------------------
# Shell variable for cron
SHELL=/bin/bash
# PATH variable for cron
PATH=/usr/local/bin:/usr/local/sbin:/sbin:/usr/sbin:/bin:/usr/bin:/usr/bin/X11
#mm  hh   d M Y   Command
#-----------------------------------------------------------------
*/15 *    * * *   /var/www/cron/mantra_cron_rm_folders.sh 45 > /dev/null
*/15 *    * * *   /var/www/cron/mantra_cron_rm_too_old_dockers.sh 1800 > /dev/null
#-----------------------------------------------------------------
```

The script ```mantra_cron_rm_folders.sh``` removes old project folders (e.g. from /tmp/projects).
The script ```mantra_cron_rm_too_old_dockers.sh``` removes Docker containers that are older than a certain threashold value. This could e.g. happen when a container is created but never started (and thus never dies). In such a case, the Mantra monitoring function is insufficient, as it only removes *exited* container.


### Licensing ###
This project is available under the MIT license. See [LICENSE](https://github.com/codeboardio/mantra/blob/master/LICENSE) for the full license text.

_Important_: This project may use 3rd party software which uses others licenses. If you're planning to use this project, make sure your use-case complies with all 3rd party licenses.
